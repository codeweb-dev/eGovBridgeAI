"use server";

import { askAssistant } from "@/lib/egov-ai";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function summarizeDocument(document: string): Promise<string> {
  const userId = await getSession();
  if (!userId) throw new Error("Not authenticated");

  const summary = await askAssistant(
    `Summarize the following government document in a concise paragraph:\n\n${document}`
  );

  await getSupabaseAdmin().from("ai_history").insert({
    user_id: userId,
    prompt: document,
    response: summary,
    kind: "summarizer",
  });

  return summary;
}
