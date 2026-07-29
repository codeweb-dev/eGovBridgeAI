import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";

export function Cta() {
  return (
    <section className="px-6 py-20">
      <Reveal className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-primary px-8 py-20 text-center text-primary-foreground sm:px-16">
        <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
          <span className="flex-1 bg-white/70" />
          <span className="flex-1 bg-brand-gold" />
          <span className="flex-1 bg-brand-red" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <p className="font-mono text-[11px] tracking-[0.22em] text-primary-foreground/60 uppercase">
          No forms &middot; No queue
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-primary-foreground/75">
          Sign in with your mobile number and file your first report in under a
          minute.
        </p>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ size: "lg" }),
            "group mt-9 gap-1.5 bg-white text-primary hover:bg-white/90",
          )}
        >
          Get Started
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Reveal>
    </section>
  );
}
