"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LivenessResponse {
  status?: unknown;
  result?: { session_id?: unknown };
}

declare global {
  interface Window {
    eKYC?: () => {
      start: (options: { pubKey: string }) => Promise<LivenessResponse>;
    };
  }
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_EVERIFY_PUBLIC_KEY;
const SDK_URL =
  "https://hackathon-everify-face-liveness.e.gov.ph/js/everify-liveness-sdk.min.js";

export function EVerifyLogin() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkFailed, setSdkFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!PUBLIC_KEY || !window.eKYC) {
      toast.error("eVerify is not ready. Please try again.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const liveness = await window.eKYC().start({ pubKey: PUBLIC_KEY });
      const sessionId = liveness.result?.session_id;
      if (liveness.status !== "COMPLETED" || typeof sessionId !== "string") {
        throw new Error("Face liveness check was not completed.");
      }

      const response = await fetch("/api/auth/everify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          middleName: form.get("middleName"),
          lastName: form.get("lastName"),
          suffix: form.get("suffix"),
          birthDate: form.get("birthDate"),
          sessionId,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Identity verification failed.");
      }

      toast.success("Identity verified. You are now signed in.");
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Identity verification failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const unavailable = !PUBLIC_KEY || sdkFailed;

  return (
    <>
      {PUBLIC_KEY && (
        <Script
          id="everify-liveness-sdk"
          src={SDK_URL}
          strategy="afterInteractive"
          onReady={() => setSdkReady(true)}
          onError={() => setSdkFailed(true)}
        />
      )}
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => !loading && setOpen(nextOpen)}
      >
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={unavailable || !sdkReady}
            />
          }
        >
          <ShieldCheck className="size-4" />
          {unavailable
            ? "eVerify setup required"
            : sdkReady
              ? "Sign in with eVerify"
              : "Loading eVerify…"}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleVerify} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Verify with your National ID</DialogTitle>
              <DialogDescription>
                Enter the details registered with PhilSys, then complete the
                secure face liveness check.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="everify-first-name">First name</Label>
                <Input
                  id="everify-first-name"
                  name="firstName"
                  autoComplete="given-name"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="everify-middle-name">
                  Middle name (optional)
                </Label>
                <Input
                  id="everify-middle-name"
                  name="middleName"
                  autoComplete="additional-name"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="everify-last-name">Last name</Label>
                <Input
                  id="everify-last-name"
                  name="lastName"
                  autoComplete="family-name"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="everify-suffix">Suffix (optional)</Label>
                <Input
                  id="everify-suffix"
                  name="suffix"
                  placeholder="Jr., III"
                  maxLength={20}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="everify-birth-date">Birth date</Label>
                <Input
                  id="everify-birth-date"
                  name="birthDate"
                  type="date"
                  autoComplete="bday"
                  required
                />
              </div>
            </div>
            <label className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground">
              <input
                type="checkbox"
                required
                className="mt-1 size-4 accent-primary"
              />
              <span>
                I consent to eVerify using my camera, facial biometric, and
                identity details for this verification.
              </span>
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <ShieldCheck className="size-4" />
                {loading ? "Verifying…" : "Start face verification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {unavailable && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Add your relying-party credentials to enable National ID sign-in.
        </p>
      )}
    </>
  );
}
