import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ReportForm } from "./report-form";

export default async function NewReportPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("full_name, email")
    .eq("id", userId)
    .single();

  const [firstName = "", ...rest] = (user?.full_name ?? "").split(" ");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <ReportForm
        initialFirstName={firstName}
        initialLastName={rest.join(" ")}
        initialEmail={user?.email ?? ""}
      />
    </main>
  );
}
