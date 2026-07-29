"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { LatLng } from "@/components/location-map";
import {
  getReportTypes,
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  improveReportDraft,
  submitReport,
  resolveLocation,
} from "./actions";

// Leaflet touches `window` on import, so the map can only load in the browser.
const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
});

interface Option {
  id: string;
  name: string;
}

// Base UI reads labels for the trigger from `items`, not from the rendered SelectItems.
const toItems = (options: Option[]) =>
  options.map((o) => ({ value: o.id, label: o.name }));

export function ReportForm({
  initialFirstName,
  initialLastName,
  initialEmail,
  initialGender,
}: {
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  initialGender: string;
}) {
  const router = useRouter();

  const [reportTypes, setReportTypes] = useState<(Option & { code: string })[]>([]);
  const [regions, setRegions] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [municipalities, setMunicipalities] = useState<Option[]>([]);
  const [barangays, setBarangays] = useState<Option[]>([]);

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [gender, setGender] = useState(initialGender);
  const [email, setEmail] = useState(initialEmail);
  const [reportType, setReportType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [municipalityCode, setMunicipalityCode] = useState("");
  const [barangayCode, setBarangayCode] = useState("");
  const [pin, setPin] = useState<LatLng | null>(null);

  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getReportTypes(), getRegions()])
      .then(([types, regionList]) => {
        setReportTypes(types);
        setRegions(regionList);
      })
      .catch(() => toast.error("Failed to load form data."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRegionChange(value: string | null) {
    setRegionCode(value ?? "");
    setProvinceCode("");
    setMunicipalityCode("");
    setBarangayCode("");
    setMunicipalities([]);
    setBarangays([]);
    setProvinces(value ? await getProvinces(value) : []);
  }

  async function handleProvinceChange(value: string | null) {
    setProvinceCode(value ?? "");
    setMunicipalityCode("");
    setBarangayCode("");
    setBarangays([]);
    setMunicipalities(value ? await getMunicipalities(value) : []);
  }

  async function handleMunicipalityChange(value: string | null) {
    setMunicipalityCode(value ?? "");
    setBarangayCode("");
    setBarangays(value ? await getBarangays(value) : []);
  }

  async function handlePin(position: LatLng) {
    setPin(position);
    setLocating(true);
    try {
      const found = await resolveLocation(position[0], position[1]);
      if (!found.region) {
        toast.info("Couldn't match that pin to a region — pick the area manually.");
        return;
      }
      setRegionCode(found.region.id);
      setProvinces(found.provinces ?? []);
      setProvinceCode(found.province?.id ?? "");
      setMunicipalities(found.municipalities ?? []);
      setMunicipalityCode(found.municipality?.id ?? "");
      setBarangays(found.barangays ?? []);
      setBarangayCode(found.barangay?.id ?? "");

      if (found.barangay) toast.success("Location filled in from your pin.");
      else toast.info("Filled in what we could match — finish the rest manually.");
    } catch {
      toast.error("Location lookup failed. Pick the area manually.");
    } finally {
      setLocating(false);
    }
  }

  async function handleImproveReport() {
    if (!message.trim() || improving) return;
    setImproving(true);
    try {
      const improved = await improveReportDraft({
        title: subject,
        category: reportTypes.find((type) => type.code === reportType)?.name,
        description: message,
      });
      setSubject(improved.title);
      setMessage(improved.description);
      toast.success("Title and description improved. Review them before submitting.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to improve the report.",
      );
    } finally {
      setImproving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !firstName ||
      !lastName ||
      !gender ||
      !email ||
      !reportType ||
      !subject ||
      !message ||
      !regionCode ||
      !provinceCode ||
      !municipalityCode ||
      !barangayCode
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReport({
        first_name: firstName,
        last_name: lastName,
        gender,
        complainant_email: email,
        report_type: reportType,
        subject,
        message,
        region_code: regionCode,
        province_code: provinceCode,
        municipality_code: municipalityCode,
        barangay_code: barangayCode,
        category_name: reportTypes.find((t) => t.code === reportType)?.name,
        latitude: pin?.[0] ?? null,
        longitude: pin?.[1] ?? null,
      });
      toast.success(`Report submitted. Case number: ${result.case_number}`);
      router.push("/dashboard/reports");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[220, 300, 260].map((h) => (
          <Skeleton key={h} className="w-full rounded-2xl" style={{ height: h }} />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section step="01" title="About you" hint="Used so the agency can reach you about this report.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Section>

      <Section step="02" title="Your report" hint="Be specific — it helps the agency route and act on it faster.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Report Category</Label>
            <Select
              items={reportTypes.map((t) => ({ value: t.code, label: t.name }))}
              value={reportType}
              onValueChange={(v) => setReportType(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((t) => (
                  <SelectItem key={t.code} value={t.code}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Report Title</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Description</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Write a short phrase, then let AI improve the title and
                description.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImproveReport}
                disabled={!message.trim() || improving || submitting}
              >
                {improving ? <Spinner /> : <Sparkles className="size-4" />}
                {improving ? "Improving…" : "Improve title & description"}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section step="03" title="Where it happened" hint="Pick down to the barangay so it reaches the right office.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select items={toItems(regions)} value={regionCode} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Province</Label>
              <Select items={toItems(provinces)} value={provinceCode} onValueChange={handleProvinceChange} disabled={!regionCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Municipality</Label>
              <Select items={toItems(municipalities)} value={municipalityCode} onValueChange={handleMunicipalityChange} disabled={!provinceCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select municipality" />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Barangay</Label>
              <Select items={toItems(barangays)} value={barangayCode} onValueChange={(v) => setBarangayCode(v ?? "")} disabled={!municipalityCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Pin the exact spot (optional)</Label>
              {pin && (
                <button
                  type="button"
                  onClick={() => setPin(null)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear pin
                </button>
              )}
            </div>
            <LocationMap
              value={pin}
              onChange={handlePin}
              className="z-0 h-64 min-h-0 rounded-xl border"
            />
            <p className="text-xs text-muted-foreground">
              {locating ? (
                "Looking up the address…"
              ) : pin ? (
                <>
                  Pinned at{" "}
                  <span className="font-mono">
                    {pin[0].toFixed(5)}, {pin[1].toFixed(5)}
                  </span>
                </>
              ) : (
                "Click the map to drop a pin, or use the locate button."
              )}
            </p>
          </div>
        </div>
      </Section>

      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          You&apos;ll get a reference number you can track under My Reports.
        </p>
        <Button
          type="submit"
          disabled={submitting || improving}
          className="group shrink-0"
        >
          {submitting ? "Submitting…" : "Submit Report"}
          {!submitting && (
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </Button>
      </div>
    </form>
  );
}

/** One step of the form: mono step number, title, and the fields it owns. */
function Section({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
          {step}
        </span>
        <div>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
