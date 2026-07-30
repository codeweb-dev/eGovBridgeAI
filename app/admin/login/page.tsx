"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ADMIN_EMAIL } from "@/lib/admin";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not sign in.");
      }

      toast.success("Welcome back, Admin.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-svh">
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
            Administration
          </p>
          <h1 className="mt-5 max-w-lg text-4xl font-bold tracking-tighter text-balance">
            One secure place to oversee public services.
          </h1>
          <p className="mt-4 max-w-sm text-primary-foreground/75">
            Protected by an admin password and server-side role checks.
          </p>
          <ul className="mt-10 space-y-3 text-sm font-medium text-primary-foreground/90">
            {[
              "Secure password verification",
              "Role-protected dashboard",
              "No public navigation link",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} eGovBridgeAI
        </p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        />
        <Link href="/" className="lg:hidden">
          <Logo />
        </Link>

        <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl shadow-primary/5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight">Admin sign in</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter the authorized email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email address</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
