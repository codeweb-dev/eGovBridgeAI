"use server";

import * as ereport from "@/lib/ereport";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getReportTypes() {
  return ereport.getReportTypes();
}

export async function getRegions() {
  return ereport.getRegions();
}

export async function getProvinces(regionCode: string) {
  return ereport.getProvinces(regionCode);
}

export async function getMunicipalities(provinceCode: string) {
  return ereport.getMunicipalities(provinceCode);
}

export async function getBarangays(municipalityCode: string) {
  return ereport.getBarangays(municipalityCode);
}

const NOISE = new Set([
  "city",
  "municipality",
  "province",
  "region",
  "of",
  "barangay",
  "brgy",
  "capital",
  "poblacion",
  "pob",
]);

function tokens(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w && !NOISE.has(w));
}

// "gen" ~ "general", "sta" ~ "santa" \u2014 abbreviations are everywhere in PSGC names.
function tokenMatch(a: string, b: string) {
  return (
    a === b || (a.length >= 3 && b.startsWith(a)) || (b.length >= 3 && a.startsWith(b))
  );
}

/**
 * How well an OSM name matches an eReport name. Weighted toward covering the OSM
 * name, so "Calabarzon" still finds "REGION IV-A (CALABARZON)".
 */
function score(candidate: string, option: string) {
  const a = tokens(candidate);
  const b = tokens(option);
  if (!a.length || !b.length) return 0;
  const hits = a.filter((x) => b.some((y) => tokenMatch(x, y))).length;
  return (hits / a.length) * 0.75 + (hits / b.length) * 0.25;
}

function matchOption(options: ereport.EreportOption[], candidates: (string | undefined)[]) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    let best: ereport.EreportOption | null = null;
    let bestScore = 0;
    for (const option of options) {
      const s = score(candidate, option.name);
      if (s > bestScore) {
        bestScore = s;
        best = option;
      }
    }
    if (best && bestScore >= 0.6) return best;
  }
  return null;
}

interface NominatimAddress {
  region?: string;
  state?: string;
  province?: string;
  county?: string;
  city?: string;
  town?: string;
  municipality?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  hamlet?: string;
}

/**
 * Turn a map pin into eReport location codes. Best effort — each level is
 * matched by name, so a miss just leaves that select for the user to fill.
 */
export async function resolveLocation(latitude: number, longitude: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${latitude}&lon=${longitude}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "eGovBridgeAI (government report location lookup)" },
  });
  if (!res.ok) throw new Error("Location lookup failed.");

  const { address = {} } = (await res.json()) as { address?: NominatimAddress };
  const empty = {
    region: null,
    provinces: [] as ereport.EreportOption[],
    province: null,
    municipalities: [] as ereport.EreportOption[],
    municipality: null,
    barangays: [] as ereport.EreportOption[],
    barangay: null,
  };

  const regions = await ereport.getRegions();
  // OSM calls NCR "Metro Manila"; nothing in the PSGC name overlaps.
  const regionName = /metro manila/i.test(address.region ?? "")
    ? "National Capital"
    : address.region;
  const region = matchOption(regions, [regionName, address.state]);
  if (!region) return empty;

  const provinces = await ereport.getProvinces(region.id);
  const cityNames = [address.city, address.town, address.municipality, address.county];

  let province = matchOption(provinces, [address.province, address.state, address.county]);
  let municipalities = province ? await ereport.getMunicipalities(province.id) : [];
  let municipality = matchOption(municipalities, cityNames);

  // Independent cities (Cebu City, Baguio, anything in NCR) carry no OSM province,
  // so fall back to hunting the city through the region's provinces.
  if (!municipality) {
    for (const candidate of provinces) {
      const list = await ereport.getMunicipalities(candidate.id);
      const hit = matchOption(list, cityNames);
      if (hit) {
        province = candidate;
        municipalities = list;
        municipality = hit;
        break;
      }
    }
  }

  if (!municipality || !province) return { ...empty, region, provinces, province };

  const barangays = await ereport.getBarangays(municipality.id);
  const barangay = matchOption(barangays, [
    address.village,
    address.quarter,
    address.suburb,
    address.hamlet,
    address.neighbourhood,
  ]);

  return { region, provinces, province, municipalities, municipality, barangays, barangay };
}

export interface SubmitReportInput {
  first_name: string;
  last_name: string;
  gender: string;
  complainant_email: string;
  report_type: string;
  subject: string;
  message: string;
  region_code: string;
  province_code: string;
  municipality_code: string;
  barangay_code: string;
  latitude?: number | null;
  longitude?: number | null;
  /** Readable label for `report_type`, so My Reports shows a name and not a code. */
  category_name?: string;
}

// These are ours, not eReport's — keep them out of the complaint payload.
export async function submitReport({
  latitude = null,
  longitude = null,
  category_name,
  ...input
}: SubmitReportInput) {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase.from("users").select("phone").eq("id", userId).single();
  if (!user) throw new Error("User not found");

  const result = await ereport.submitComplaint({ ...input, mobile: user.phone });

  const { error } = await supabase.from("reports").insert({
    user_id: userId,
    report_api_id: result.case_number,
    category: category_name || input.report_type,
    title: input.subject,
    description: input.message,
    status: "Pending",
    latitude,
    longitude,
  });
  // Filed with the agency but missing locally — surface it rather than lose it silently.
  if (error) console.error("reports insert failed", result.case_number, error);

  await supabase
    .from("users")
    .update({ full_name: `${input.first_name} ${input.last_name}`, email: input.complainant_email })
    .eq("id", userId);

  return result;
}
