import Link from "next/link";
import { ShieldCheck, Bot, ClipboardCheck, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Reveal } from "@/components/landing/reveal";

const trustPoints = [
  { icon: ShieldCheck, label: "OTP-verified sign-in" },
  { icon: Bot, label: "AI-powered assistant" },
  { icon: ClipboardCheck, label: "Real-time report tracking" },
];

const timeline = [
  { label: "Received", at: "2:41 PM", done: true },
  { label: "In review", at: "3:02 PM", done: true },
  { label: "Resolved", at: "Pending", done: false },
];

export function Hero() {
  return (
    // ponytail: 65px = header height (h-14 logo + py-1 + border)
    <section className="relative flex min-h-[calc(100dvh-65px)] flex-col justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Reveal>
            <Eyebrow>Your bridge to government services</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl font-bold tracking-tighter text-balance sm:text-5xl xl:text-6xl">
              All government services.
              <br />
              <span className="text-primary">One dashboard.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-lg text-pretty text-muted-foreground">
              File reports, ask questions, and get instant AI-powered help with
              government services, verified securely with your mobile number.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className={buttonVariants({ size: "lg", className: "group" })}
              >
                Get Started
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                See how it works
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6">
              {trustPoints.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Icon className="size-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* The thing this product actually gives you: a filed report you can follow. */}
        <Reveal delay={0.18} className="relative mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-primary/10">
            <div aria-hidden className="flex h-1.5">
              <span className="flex-1 bg-primary" />
              <span className="flex-1 bg-brand-gold" />
              <span className="flex-1 bg-brand-red" />
            </div>
            <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  Reference no.
                </p>
                <p className="mt-1 font-mono text-lg font-medium">
                  EGB-2026-0417
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-red dark:text-brand-gold">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-red opacity-75 dark:bg-brand-gold" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand-red dark:bg-brand-gold" />
                </span>
                In review
              </span>
            </div>

            <div className="px-6 py-5">
              <p className="font-semibold">Pothole on Rizal St.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Filed today &middot; Public Works
              </p>

              <ol className="mt-6 space-y-4">
                {timeline.map(({ label, at, done }, i) => (
                  <li key={label} className="relative flex items-center gap-3">
                    {i < timeline.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute top-3 left-1.25 h-full w-px bg-border"
                      />
                    )}
                    <span
                      aria-hidden
                      className={`relative z-10 size-2.5 shrink-0 rounded-full ${
                        done ? "bg-primary" : "bg-border ring-2 ring-background"
                      }`}
                    />
                    <span
                      className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}
                    >
                      {label}
                    </span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {at}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-start gap-3 border-t bg-muted/40 px-6 py-4">
              <Bot className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                &ldquo;Your report was routed to the district engineering
                office.&rdquo;
              </p>
            </div>
          </div>
          <div
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-primary/15 blur-3xl"
            aria-hidden
          />
        </Reveal>
      </div>
    </section>
  );
}
