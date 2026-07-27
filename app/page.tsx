import Link from "next/link";
import { ShieldCheck, Bot, ClipboardCheck, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { dashboardCards } from "./dashboard/cards";

const trustPoints = [
  { icon: ShieldCheck, label: "OTP-verified sign-in" },
  { icon: Bot, label: "AI-powered assistant" },
  { icon: ClipboardCheck, label: "Real-time report tracking" },
];

const steps = [
  {
    number: "01",
    title: "Verify your mobile number",
    description: "Sign in with a one-time code sent straight to your phone. No passwords to remember.",
  },
  {
    number: "02",
    title: "Access government services",
    description: "Submit a report, ask the AI assistant a question, or summarize a document.",
  },
  {
    number: "03",
    title: "Track everything in one place",
    description: "Follow your report status and revisit your AI chat history whenever you need to.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <span className="text-lg font-bold tracking-tight">
          eGov<span className="text-primary">Bridge</span>AI
        </span>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how-it-works" className="hover:text-foreground">How it Works</a>
          <a href="#security" className="hover:text-foreground">Security</a>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link href="/login" className={buttonVariants()}>
            Get Started
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,_color-mix(in_oklch,var(--primary)_25%,transparent)_1px,_transparent_1px)] [background-size:22px_22px]"
          aria-hidden
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Your bridge to government services
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              All Government Services.<br />
              <span className="text-primary">One Dashboard.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              File reports, ask questions, and get instant AI-powered help with
              government services, verified securely with your mobile number.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className={buttonVariants({ size: "lg" })}
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                See how it works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {trustPoints.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="size-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-2xl border bg-card shadow-xl shadow-primary/5">
              <div className="flex items-center gap-1.5 border-b px-4 py-3">
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="ml-2 text-xs font-medium text-muted-foreground">eGovBridgeAI Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {dashboardCards.map(({ title, icon: Icon }) => (
                  <div key={title} className="rounded-lg border bg-muted/50 p-3">
                    <Icon className="size-5 text-primary" />
                    <p className="mt-2 text-xs font-medium">{title}</p>
                  </div>
                ))}
              </div>
              <div className="mx-4 mb-4 rounded-lg bg-primary p-3 text-xs text-primary-foreground">
                <p className="font-medium">AI Assistant</p>
                <p className="mt-1 opacity-80">&ldquo;How do I get my digital TIN ID?&rdquo;</p>
              </div>
            </div>
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-primary/15 blur-2xl"
              aria-hidden
            />
          </div>
        </div>
      </section>

      <section id="features" className="relative bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight">Everything in one place</h2>
            <p className="mt-3 text-muted-foreground">
              No more switching between apps and offices. Handle it all from a single dashboard.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {dashboardCards.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-xl border bg-card p-6">
                <Icon className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map(({ number, title, description }) => (
              <div key={number}>
                <span className="text-sm font-bold text-primary">{number}</span>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <ShieldCheck className="mx-auto size-8 text-primary" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Secure by design</h2>
          <p className="mt-3 text-muted-foreground">
            Every sign-in is verified with a one-time code sent directly to your
            phone, no passwords to leak or forget. Reports go straight to the
            eReport government API, and your data stays in a database only
            eGovBridgeAI's servers can reach.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-8 py-14 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-md text-blue-100">
            Sign in with your mobile number, no forms, no waiting in line.
          </p>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 gap-1.5 bg-white text-blue-700 hover:bg-blue-50")}
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-10 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <span className="text-base font-bold text-white">
              eGov<span className="text-blue-500">Bridge</span>AI
            </span>
            <p className="mt-1 text-sm">Your bridge to government services.</p>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} eGovBridgeAI</p>
        </div>
      </footer>
    </div>
  );
}
