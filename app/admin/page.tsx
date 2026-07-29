import { redirect } from "next/navigation";
import { ClipboardList, Clock3, Users, CircleCheck } from "lucide-react";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Reveal } from "@/components/landing/reveal";
import { AppSidebar, PageTitle } from "@/app/dashboard/app-sidebar";

export default async function AdminDashboardPage() {
  const userId = await getSession();
  if (!userId) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  const { data: admin } = await supabase
    .from("users")
    .select("email, role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "admin") redirect("/admin/login");

  const [
    { count: users },
    { count: reports },
    { count: pending },
    { count: completed },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending"),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "Completed"),
  ]);

  const cards = [
    {
      title: "Registered Users",
      value: users ?? 0,
      description: "Citizen accounts in the platform.",
      icon: Users,
    },
    {
      title: "All Reports",
      value: reports ?? 0,
      description: "Reports submitted through eGovBridgeAI.",
      icon: ClipboardList,
    },
    {
      title: "Pending",
      value: pending ?? 0,
      description: "Reports currently awaiting action.",
      icon: Clock3,
    },
    {
      title: "Completed",
      value: completed ?? 0,
      description: "Reports marked as completed.",
      icon: CircleCheck,
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar
        admin
        name="Administrator"
        phone={admin.email ?? ""}
        initials="ADM"
      />
      <SidebarInset className="min-h-svh">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4!" />
          <PageTitle />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>

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
              {cards.map(({ title, value, description, icon: Icon }, i) => (
                <Reveal key={title} delay={0.06 * i}>
                  <div className="flex h-full flex-col rounded-2xl border bg-card p-6">
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
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
