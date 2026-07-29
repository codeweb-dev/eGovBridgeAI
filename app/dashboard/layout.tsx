import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, PageTitle } from "./app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("phone, full_name")
    .eq("id", userId)
    .single();

  return (
    <SidebarProvider>
      <AppSidebar
        name={user?.full_name || user?.phone || "Account"}
        phone={user?.phone ?? ""}
        initials={(user?.full_name || user?.phone || "").slice(0, 3).toUpperCase()}
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
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
