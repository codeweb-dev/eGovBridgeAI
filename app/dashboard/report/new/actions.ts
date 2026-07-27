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
}

export async function submitReport(input: SubmitReportInput) {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase.from("users").select("phone").eq("id", userId).single();
  if (!user) throw new Error("User not found");

  const result = await ereport.submitComplaint({ ...input, mobile: user.phone });

  await supabase.from("reports").insert({
    user_id: userId,
    report_api_id: result.case_number,
    category: input.report_type,
    title: input.subject,
    description: input.message,
    status: "Pending",
  });

  await supabase
    .from("users")
    .update({ full_name: `${input.first_name} ${input.last_name}`, email: input.complainant_email })
    .eq("id", userId);

  return result;
}
