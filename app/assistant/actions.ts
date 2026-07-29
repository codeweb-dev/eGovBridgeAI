"use server";

import { askAssistant } from "@/lib/egov-ai";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
