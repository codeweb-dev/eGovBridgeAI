import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Chat } from "./chat";

export default async function AssistantPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const supabase = getSupabaseAdmin();
  const [{ data: history }, { data: user }] = await Promise.all([
    supabase
      .from("ai_history")
      .select("id, prompt, response, created_at")
      .eq("user_id", userId)
      .eq("kind", "assistant")
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("full_name, email, gender")
      .eq("id", userId)
      .single(),
  ]);

  const [firstName = "", ...rest] = (user?.full_name ?? "").split(" ");

  return (
    <Chat
      history={history ?? []}
      firstName={firstName || "there"}
      lastName={rest.join(" ")}
      email={user?.email ?? ""}
      gender={user?.gender ?? ""}
    />
  );
}
