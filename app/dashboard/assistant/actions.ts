"use server";

import { askAssistant } from "@/lib/egov-ai";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function sendMessage(prompt: string): Promise<string> {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const response = await askAssistant(prompt);

  await getSupabaseAdmin().from("ai_history").insert({
    user_id: userId,
    prompt,
    response,
    kind: "assistant",
  });

  return response;
}
