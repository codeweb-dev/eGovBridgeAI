"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Phone, ShieldCheck, ArrowLeft, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { dashboardCards } from "../dashboard/cards";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
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
        body: JSON.stringify({ phone, code, challenge }),
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
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_1px,_transparent_1px)] [background-size:22px_22px]"
          aria-hidden
        />
        <Link href="/" className="relative text-lg font-bold tracking-tight">
          eGov<span className="text-blue-200">Bridge</span>AI
        </Link>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Your bridge to government services.
          </h1>
          <p className="mt-3 max-w-sm text-blue-100">
            Sign in once with your mobile number to file reports, chat with the
            AI assistant, and summarize documents.
          </p>
          <ul className="mt-8 space-y-3">
            {dashboardCards.map(({ title }) => (
              <li key={title} className="flex items-center gap-2 text-sm font-medium text-blue-50">
                <CircleCheck className="size-4 shrink-0" />
                {title}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-blue-200">&copy; {new Date().getFullYear()} eGovBridgeAI</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,_color-mix(in_oklch,var(--primary)_25%,transparent)_1px,_transparent_1px)] [background-size:22px_22px] lg:hidden"
          aria-hidden
        />
        <Link href="/" className="text-lg font-bold tracking-tight lg:hidden">
          eGov<span className="text-primary">Bridge</span>AI
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {step === "phone" ? <Phone className="size-5" /> : <ShieldCheck className="size-5" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {step === "phone" ? "Sign in" : "Verify your number"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === "phone"
                  ? "Enter your mobile number to receive a one-time code."
                  : `Enter the code sent to ${phone}.`}
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <span className={cn("h-1.5 flex-1 rounded-full", step === "phone" || step === "otp" ? "bg-primary" : "bg-muted")} />
            <span className={cn("h-1.5 flex-1 rounded-full", step === "otp" ? "bg-primary" : "bg-muted")} />
          </div>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+639090000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Sending…" : "Send code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                  required
                  className="text-center text-lg tracking-[0.5em]"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Verifying…" : "Verify"}
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
        </div>
      </div>
    </main>
  );
}
