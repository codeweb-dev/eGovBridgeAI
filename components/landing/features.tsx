import {
  FileText,
  ClipboardList,
  Bot,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Eyebrow } from "@/components/landing/eyebrow";

const reports = [
  { ref: "EGB-2026-0417", label: "Pothole on Rizal St.", status: "In review" },
  { ref: "EGB-2026-0388", label: "Streetlight outage", status: "Resolved" },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-20 px-6 py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Eyebrow>Features</Eyebrow>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
            Everything in one place
          </h2>
          <p className="max-w-sm text-muted-foreground">
            No more switching between apps and offices. Handle it all from a
            single dashboard.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Submit Report — the big tile */}
          <div className="group relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:col-span-2 lg:row-span-2">
            <div className="flex items-center gap-3">
              <FileText className="size-5" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-primary-foreground/60 uppercase">
                Step one
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tighter">
              Submit a report
            </h3>
            <p className="mt-2 max-w-xs text-sm text-primary-foreground/75">
              Pick a category, describe what happened, send. It lands with the
              right agency, not a general inbox.
            </p>
            <div className="mt-5 rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
              <div className="flex flex-wrap gap-1.5">
                {["Roads", "Waste", "Water", "Peace & order"].map((tag, i) => (
                  <span
                    key={tag}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      i === 0
                        ? "bg-white text-primary"
                        : "bg-white/10 text-primary-foreground/70"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-white/25" />
                <div className="h-1.5 w-4/5 rounded-full bg-white/20" />
                <div className="h-1.5 w-2/3 rounded-full bg-white/15" />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-primary">
                Send report
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-white/5 blur-2xl"
            />
          </div>

          {/* AI Assistant */}
          <div className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40">
            <Bot className="size-5 text-primary" />
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              AI assistant
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask government-related questions and get instant answers.
            </p>
            <div className="mt-5 space-y-2 text-xs">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-primary-foreground">
                How do I get my digital TIN ID?
              </p>
              <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2">
                Register on the BIR portal, then&hellip;
              </p>
            </div>
          </div>

          {/* My Reports */}
          <div className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40">
            <ClipboardList className="size-5 text-primary" />
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              My reports
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow every report you&apos;ve filed by reference number.
            </p>
            <div className="mt-5 space-y-2">
              {reports.map(({ ref, label, status }) => (
                <div key={ref} className="rounded-xl bg-muted/60 px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                      {ref}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        status === "Resolved"
                          ? "bg-primary/10 text-primary"
                          : "bg-brand-gold/20 text-brand-red"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Document Summarizer — wide tile */}
          <div className="rounded-2xl border bg-muted/40 p-6 transition-colors hover:border-primary/40 sm:col-span-2 lg:col-span-3">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Sparkles className="size-5 text-primary" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  Document summarizer
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Drop in a memo, ordinance, or notice. Get the parts that
                  affect you, in plain language.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-28 space-y-1.5 rounded-xl border bg-card p-3">
                  {["w-full", "w-5/6", "w-full", "w-4/6", "w-full", "w-3/6"].map(
                    (w, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full bg-muted-foreground/20 ${w}`}
                      />
                    ),
                  )}
                </div>
                <ArrowRight className="size-5 shrink-0 text-primary" />
                <div className="w-28 space-y-1.5 rounded-xl border bg-card p-3">
                  <div className="h-1.5 w-full rounded-full bg-primary/60" />
                  <div className="h-1.5 w-4/6 rounded-full bg-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
