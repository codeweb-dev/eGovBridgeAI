import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  MapPinned,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Reveal } from "@/components/landing/reveal";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const [
    { count: users },
    { count: reports },
    { count: pending },
    { count: mapped },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "user"),
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending"),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .not("latitude", "is", null)
      .not("longitude", "is", null),
  ]);

  const cards = [
    {
      title: "Registered Users",
      value: users ?? 0,
      description: "Citizen accounts in the platform.",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "All Reports",
      value: reports ?? 0,
      description: "Reports submitted through eGovBridgeAI.",
      href: "/admin/reports",
      icon: ClipboardList,
    },
    {
      title: "Pending",
      value: pending ?? 0,
      description: "Reports currently awaiting action.",
      href: "/admin/reports",
      icon: Clock3,
    },
    {
      title: "Mapped Reports",
      value: mapped ?? 0,
      description: "Reports with an exact pinned location.",
      href: "/admin/map",
      icon: MapPinned,
    },
  ];

  return (
    <div className="relative flex-1 px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
      />
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <Eyebrow>Admin Dashboard</Eyebrow>
          <h1 className="mt-5 text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
            Welcome back, <span className="text-primary">Admin</span>
          </h1>
          <p className="mt-3 max-w-md text-pretty text-muted-foreground">
            A live overview of citizens and reports across the platform.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {cards.map(({ title, value, description, href, icon: Icon }, i) => (
            <Reveal key={title} delay={0.06 * i}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <Icon className="size-5 text-primary" />
                <p className="mt-5 text-3xl font-bold tracking-tight tabular-nums">
                  {value.toLocaleString()}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight">
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
