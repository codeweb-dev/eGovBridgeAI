"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { dashboardCards } from "../dashboard/cards";

const steps = [
  {
    id: "phone",
    title: "Your number",
    description: "We send a 6-digit code by SMS.",
  },
  {
    id: "otp",
    title: "Verify",
    description: "Enter the code to sign in.",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);

  const current = steps.findIndex((s) => s.id === step);
  // ponytail: PH-only product, so the country code is fixed rather than a picker
  const e164 = `+63${phone.replace(/\D/g, "").replace(/^0+/, "")}`;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChallenge(data.challenge);
      setStep("otp");
      toast.success("Code sent. Check your phone.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164, code, challenge }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Logged in.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
          <span className="flex-1 bg-white/70" />
          <span className="flex-1 bg-brand-gold" />
          <span className="flex-1 bg-brand-red" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[24px_24px] [mask-image:radial-gradient(ellipse_80%_70%_at_40%_40%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-24 size-96 rounded-full bg-white/10 blur-3xl"
        />

        <Link
          href="/"
          className="relative w-fit rounded-2xl bg-white px-3 py-2 shadow-lg shadow-black/10"
        >
          <Logo />
        </Link>

        <div className="relative">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary-foreground/60 uppercase">
            Sign in
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tighter text-balance">
            Your bridge to government services.
          </h1>
          <p className="mt-4 max-w-sm text-primary-foreground/75">
            One mobile number gets you into every service. No passwords, no
            queue number, no second trip to the office.
          </p>
          <ul className="mt-10 space-y-3">
            {dashboardCards.map(({ title }) => (
              <li
                key={title}
                className="flex items-center gap-2.5 text-sm font-medium text-primary-foreground/90"
              >
                <CircleCheck className="size-4 shrink-0" />
                {title}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} eGovBridgeAI
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        />
        <Link href="/" className="lg:hidden">
          <Logo />
        </Link>

        <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl shadow-primary/5">
          {/* Step by step */}
          <ol className="flex items-center gap-3">
            {steps.map(({ id, title }, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      active && "border-primary bg-primary text-white",
                      done && "border-primary bg-primary/10 text-primary",
                      !active && !done && "border-border text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      !active && !done && "text-muted-foreground",
                    )}
                  >
                    {title}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className={cn(
                        "h-px w-8 transition-colors",
                        done ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            {steps[current].description}
          </p>

          <div className="my-7 border-t" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "phone" ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile number</Label>
                    <div className="flex">
                      <span className="flex items-center gap-1.5 rounded-l-md border border-r-0 bg-muted px-3 text-sm font-medium">
                        <span aria-hidden>🇵🇭</span>
                        +63
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="909 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoFocus
                        required
                        className="rounded-l-none"
                        aria-describedby="phone-hint"
                      />
                    </div>
                    <p
                      id="phone-hint"
                      className="text-xs text-muted-foreground"
                    >
                      Philippine mobile number, without the leading 0. Standard
                      SMS rates apply.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="group w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Sending…" : "Send code"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification code</Label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="code"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoFocus
                        required
                        className="h-12 px-9 text-center font-mono text-lg tracking-[0.5em] indent-[0.5em]"
                        aria-describedby="code-hint"
                      />
                    </div>
                    <p id="code-hint" className="text-xs text-muted-foreground">
                      Sent to {e164}. The code expires in 5 minutes.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Verifying…" : "Verify and sign in"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" />
                    Use a different number
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="max-w-sm text-center text-xs text-muted-foreground">
          By signing in you agree to the Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
