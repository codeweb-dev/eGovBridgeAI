import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { dashboardCards } from "./cards";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("phone, full_name")
    .eq("id", userId)
    .single();

  const displayName = user?.full_name || user?.phone || "there";
  const initials = (user?.full_name || user?.phone || "")
    .slice(0, 3)
    .toUpperCase();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>
            {initials || <User className="size-4" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">Welcome to the Dashboard</h1>
          <p className="text-sm text-muted-foreground">{user?.phone}</p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {dashboardCards.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/40">
              <CardHeader>
                <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
