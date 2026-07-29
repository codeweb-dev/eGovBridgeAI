"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * eReport has no update or delete endpoint, so both of these only touch our
 * copy of the report. The agency's case keeps whatever was filed.
 */
export async function updateReport(
  id: string,
  input: {
    title: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
  },
) {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");
  if (!input.title.trim()) throw new Error("A title is required.");

  const { error } = await getSupabaseAdmin()
    .from("reports")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error("Failed to update the report.");
  revalidatePath("/dashboard/reports");
}

export async function deleteReport(id: string) {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await getSupabaseAdmin()
    .from("reports")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error("Failed to delete the report.");
  revalidatePath("/dashboard/reports");
}
