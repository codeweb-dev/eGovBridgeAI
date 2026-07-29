"use client";

import { useEffect, useId, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Check, ChevronLeft, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { LatLng } from "@/components/location-map";
import { Reasoning, ToolHeader, type ReasoningStep } from "./tool-card";
import {
  getBarangays,
  getMunicipalities,
  getProvinces,
  getRegions,
  getReportTypes,
  resolveLocation,
  submitReport,
} from "@/app/dashboard/report/new/actions";

// Leaflet touches `window` on import, so the map can only load in the browser.
const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full rounded-xl" />,
});

interface Option {
  id: string;
  name: string;
}

// Base UI reads trigger labels from `items`, not from the rendered SelectItems.
const toItems = (options: Option[]) =>
  options.map((o) => ({ value: o.id, label: o.name }));

const STEPS = ["About you", "The report", "Where it happened"];

/**
 * An inline, three-step report filer that posts through the same server actions
 * as /dashboard/report/new — including the map pin, so reports filed from chat
 * carry coordinates and show up on the map tool.
 */
export function ReportTool({
  firstName = "",
  lastName = "",
  email = "",
  gender = "",
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
}) {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [pin, setPin] = useState<LatLng | null>(null);

  const [reportTypes, setReportTypes] = useState<(Option & { code: string })[]>(
    [],
  );
  const [regions, setRegions] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [municipalities, setMunicipalities] = useState<Option[]>([]);
  const [barangays, setBarangays] = useState<Option[]>([]);

  const [form, setForm] = useState({
    first_name: firstName,
    last_name: lastName,
    gender,
    complainant_email: email,
    report_type: "",
    subject: "",
    message: "",
    region_code: "",
    province_code: "",
    municipality_code: "",
    barangay_code: "",
  });

  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    Promise.all([getReportTypes(), getRegions()])
      .then(([types, regionList]) => {
        setReportTypes(types);
        setRegions(regionList);
      })
      .catch(() => toast.error("Failed to load the report form."))
      .finally(() => setLoading(false));
  }, []);

  // Each level clears the ones below it, same as the full report form.
  async function pickRegion(value: string) {
    setForm((f) => ({
      ...f,
      region_code: value,
      province_code: "",
      municipality_code: "",
      barangay_code: "",
    }));
    setMunicipalities([]);
    setBarangays([]);
    setProvinces(value ? await getProvinces(value) : []);
  }

  async function pickProvince(value: string) {
    setForm((f) => ({
      ...f,
      province_code: value,
      municipality_code: "",
      barangay_code: "",
    }));
    setBarangays([]);
    setMunicipalities(value ? await getMunicipalities(value) : []);
  }

  async function pickMunicipality(value: string) {
    setForm((f) => ({ ...f, municipality_code: value, barangay_code: "" }));
    setBarangays(value ? await getBarangays(value) : []);
  }

  /** A pin both files the coordinates and fills in whatever area it matches. */
  async function handlePin(position: LatLng) {
    setPin(position);
    setLocating(true);
    try {
      const found = await resolveLocation(position[0], position[1]);
      if (!found.region) {
        toast.info(
          "Couldn't match that pin to a region — pick the area above.",
        );
        return;
      }
      setProvinces(found.provinces ?? []);
      setMunicipalities(found.municipalities ?? []);
      setBarangays(found.barangays ?? []);
      setForm((f) => ({
        ...f,
        region_code: found.region?.id ?? "",
        province_code: found.province?.id ?? "",
        municipality_code: found.municipality?.id ?? "",
        barangay_code: found.barangay?.id ?? "",
      }));
      if (found.barangay) toast.success("Location filled in from your pin.");
      else toast.info("Filled in what matched — finish the rest above.");
    } catch {
      toast.error("Location lookup failed. Pick the area above.");
    } finally {
      setLocating(false);
    }
  }

  const filled: Record<number, boolean> = {
    0: Boolean(
      form.first_name &&
      form.last_name &&
      form.gender &&
      form.complainant_email,
    ),
    1: Boolean(form.report_type && form.subject && form.message),
    2: Boolean(
      form.region_code &&
      form.province_code &&
      form.municipality_code &&
      form.barangay_code,
    ),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!filled[step]) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReport({
        ...form,
        category_name: reportTypes.find((t) => t.code === form.report_type)
          ?.name,
        latitude: pin?.[0] ?? null,
        longitude: pin?.[1] ?? null,
      });
      setCaseNumber(result.case_number);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit report.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const steps: ReasoningStep[] = [
    {
      label: "Loading the agency's categories and locations",
      status: loading ? "running" : "done",
    },
    {
      label: caseNumber
        ? `Filed as ${caseNumber}`
        : submitting
          ? "Sending it to the agency"
          : `Collecting your details — step ${step + 1} of ${STEPS.length}`,
      status: caseNumber ? "done" : submitting ? "running" : "pending",
    },
  ];

  if (caseNumber) {
    return (
      <div className="w-full space-y-3">
        <Reasoning steps={steps} />
        <div className="overflow-hidden rounded-2xl border bg-card">
          <ToolHeader name="file_report" status="done" label="Filed" />
          <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-medium tracking-tight">Report submitted</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reference{" "}
                <span className="font-mono text-foreground">{caseNumber}</span>{" "}
                — keep it to follow the case.
              </p>
            </div>
            <Link
              href="/dashboard/reports"
              className={`${buttonVariants({ variant: "outline", size: "sm" })} sm:ml-auto`}
            >
              My Reports
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <Reasoning steps={steps} />
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
      >
        <ToolHeader
          name="file_report"
          status={submitting ? "running" : "waiting"}
          label={`${step + 1} / ${STEPS.length}`}
        />
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-500"
            style={{ width: `${((step + (filled[step] ? 1 : 0)) / 3) * 100}%` }}
          />
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="font-medium tracking-tight">{STEPS[step]}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {
                [
                  "So the agency can reach you about this.",
                  "Be specific — it gets routed and acted on faster.",
                  "Down to the barangay, so it lands with the right office.",
                ][step]
              }
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor={`${uid}-first`}>
                <Input
                  id={`${uid}-first`}
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  placeholder="Juan"
                />
              </Field>
              <Field label="Last name" htmlFor={`${uid}-last`}>
                <Input
                  id={`${uid}-last`}
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  placeholder="Dela Cruz"
                />
              </Field>
              <Field label="Email" htmlFor={`${uid}-email`}>
                <Input
                  id={`${uid}-email`}
                  type="email"
                  value={form.complainant_email}
                  onChange={(e) => set("complainant_email", e.target.value)}
                  placeholder="juan@email.com"
                />
              </Field>
              <Field label="Gender">
                <Picker
                  placeholder="Select gender"
                  options={[
                    { id: "Male", name: "Male" },
                    { id: "Female", name: "Female" },
                  ]}
                  value={form.gender}
                  onChange={(v) => set("gender", v)}
                />
              </Field>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <Field label="Category">
                <Picker
                  placeholder="What is this about?"
                  options={reportTypes.map((t) => ({
                    id: t.code,
                    name: t.name,
                  }))}
                  value={form.report_type}
                  onChange={(v) => set("report_type", v)}
                />
              </Field>
              <Field label="Title" htmlFor={`${uid}-subject`}>
                <Input
                  id={`${uid}-subject`}
                  value={form.subject}
                  onChange={(e) => set("subject", e.target.value)}
                  placeholder="Broken streetlight on Rizal St."
                />
              </Field>
              <Field label="Description" htmlFor={`${uid}-message`}>
                <Textarea
                  id={`${uid}-message`}
                  rows={4}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="What happened, when, and anything the agency should know."
                  className="resize-none"
                />
              </Field>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Region">
                <Picker
                  placeholder="Select region"
                  options={regions}
                  value={form.region_code}
                  onChange={pickRegion}
                />
              </Field>
              <Field label="Province">
                <Picker
                  placeholder="Select province"
                  options={provinces}
                  value={form.province_code}
                  onChange={pickProvince}
                  disabled={!form.region_code}
                />
              </Field>
              <Field label="Municipality">
                <Picker
                  placeholder="Select municipality"
                  options={municipalities}
                  value={form.municipality_code}
                  onChange={pickMunicipality}
                  disabled={!form.province_code}
                />
              </Field>
              <Field label="Barangay">
                <Picker
                  placeholder="Select barangay"
                  options={barangays}
                  value={form.barangay_code}
                  onChange={(v) => set("barangay_code", v)}
                  disabled={!form.municipality_code}
                />
              </Field>
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Pin the exact spot (optional)
                  </Label>
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
                  className="z-0 h-56 min-h-0 rounded-xl border"
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
                    "Click the map to drop a pin — it fills in the area above."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t bg-muted/30 px-5 py-3">
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={submitting}
            >
              <ChevronLeft className="size-3.5" />
              Back
            </Button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:inline">
              {STEPS[step]}
            </span>
            <Button
              type="submit"
              size="sm"
              className="group"
              disabled={loading || submitting || !filled[step]}
            >
              {submitting ? <Spinner /> : null}
              {step < 2 ? "Continue" : submitting ? "Filing…" : "File report"}
              {!submitting && (
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Picker({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <Select
      items={toItems(options)}
      value={value}
      onValueChange={(v) => onChange(v ?? "")}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
