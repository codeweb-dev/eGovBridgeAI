import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { dashboardCards } from "./cards";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Reveal } from "@/components/landing/reveal";

export default async function DashboardPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("phone, full_name")
    .eq("id", userId)
    .single();

  const firstName = user?.full_name?.split(" ")[0] || user?.phone || "there";

  return (
    <div className="relative flex-1 px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
      />
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <Eyebrow>Dashboard</Eyebrow>
          <h1 className="mt-5 text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
            Welcome back, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="mt-3 max-w-md text-pretty text-muted-foreground">
            File a report, follow one you&apos;ve already sent, or ask the
            assistant — everything in one place.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {dashboardCards.map(({ title, description, href, icon: Icon }, i) => (
            <Reveal key={href} delay={0.06 * i}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <Icon className="size-5 text-primary" />
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
                <span className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
