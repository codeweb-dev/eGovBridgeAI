"use server";

import { askAssistant } from "@/lib/egov-ai";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Report } from "@/app/dashboard/reports/reports-table";

export interface ChatEntry {
  id: string;
  prompt: string;
  response: string;
  created_at: string;
}

export async function sendMessage(prompt: string): Promise<ChatEntry> {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const response = await askAssistant(prompt);

  const { data } = await getSupabaseAdmin()
    .from("ai_history")
    .insert({ user_id: userId, prompt, response, kind: "assistant" })
    .select("id, prompt, response, created_at")
    .single();

  // The answer is worth showing even if we failed to record it.
  return data ?? { id: `local-${Date.now()}`, prompt, response, created_at: new Date().toISOString() };
}

/** Reverse-geocode a pin to a readable place name for the prompt. Falls back to coordinates. */
export async function describeLocation(lat: number, lng: number): Promise<string> {
  const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat=${lat}&lon=${lng}`,
      { headers: { "User-Agent": "eGovBridgeAI (assistant location lookup)" } },
    );
    if (!res.ok) return coords;
    const { display_name } = (await res.json()) as { display_name?: string };
    return display_name || coords;
  } catch {
    return coords;
  }
}

/** Same columns the My Reports page loads, so the chat can render the same rows. */
export async function listMyReports(): Promise<Report[]> {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const { data } = await getSupabaseAdmin()
    .from("reports")
    .select(
      "id, report_api_id, category, title, description, status, created_at, latitude, longitude",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function deleteChat(id: string) {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await getSupabaseAdmin()
    .from("ai_history")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error("Failed to delete chat.");
}
