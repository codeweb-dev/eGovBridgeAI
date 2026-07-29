import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Eyebrow } from "@/components/landing/eyebrow";
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
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-6 py-10">
      <div>
        <Eyebrow>Submit Report</Eyebrow>
        <h1 className="mt-5 text-3xl font-bold tracking-tighter">
          File a report
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Three steps. It lands with the right agency, not a general inbox.
        </p>
      </div>
      <ReportForm
        initialFirstName={firstName}
        initialLastName={rest.join(" ")}
        initialEmail={user?.email ?? ""}
      />
    </div>
  );
}
