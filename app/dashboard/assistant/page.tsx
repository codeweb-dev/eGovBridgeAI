import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Chat } from "./chat";

export default async function AssistantPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const { data: history } = await getSupabaseAdmin()
    .from("ai_history")
    .select("prompt, response, created_at")
    .eq("user_id", userId)
    .eq("kind", "assistant")
    .order("created_at", { ascending: true });

  const initialMessages = (history ?? []).flatMap((h) => [
    { role: "user" as const, content: h.prompt },
    { role: "assistant" as const, content: h.response },
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">AI Assistant</h1>
      <Chat initialMessages={initialMessages} />
    </main>
  );
}
