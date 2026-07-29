"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/session";

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function adminLogout() {
  await clearSession();
  redirect("/admin/login");
}
