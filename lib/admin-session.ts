import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const requireAdmin = cache(async () => {
  const userId = await getSession();
  if (!userId) redirect("/admin/login");

  const { data: admin } = await getSupabaseAdmin()
    .from("users")
    .select("id, email, role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "admin") redirect("/admin/login");
  return admin;
});
