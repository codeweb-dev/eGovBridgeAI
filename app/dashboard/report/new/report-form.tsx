"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getReportTypes,
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  submitReport,
} from "./actions";

interface Option {
  id: string;
  name: string;
}

export function ReportForm({
  initialFirstName,
  initialLastName,
  initialEmail,
}: {
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
}) {
  const router = useRouter();

  const [reportTypes, setReportTypes] = useState<(Option & { code: string })[]>([]);
  const [regions, setRegions] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [municipalities, setMunicipalities] = useState<Option[]>([]);
  const [barangays, setBarangays] = useState<Option[]>([]);

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [reportType, setReportType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [municipalityCode, setMunicipalityCode] = useState("");
  const [barangayCode, setBarangayCode] = useState("");

  const [loading, setLoading] = useState(true);
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
            <Select value={reportType} onValueChange={(v) => setReportType(v ?? "")}>
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
          </div>
        </div>
      </Section>

      <Section step="03" title="Where it happened" hint="Pick down to the barangay so it reaches the right office.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={regionCode} onValueChange={handleRegionChange}>
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
              <Select value={provinceCode} onValueChange={handleProvinceChange} disabled={!regionCode}>
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
              <Select value={municipalityCode} onValueChange={handleMunicipalityChange} disabled={!provinceCode}>
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
              <Select value={barangayCode} onValueChange={(v) => setBarangayCode(v ?? "")} disabled={!municipalityCode}>
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

        </div>
      </Section>

      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          You&apos;ll get a reference number you can track under My Reports.
        </p>
        <Button type="submit" disabled={submitting} className="group shrink-0">
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
