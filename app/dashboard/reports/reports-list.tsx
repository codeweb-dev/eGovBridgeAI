import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ReportsTable } from "./reports-table";

export async function ReportsList({ userId }: { userId: string }) {
  const { data: reports } = await getSupabaseAdmin()
    .from("reports")
    .select(
      "id, report_api_id, category, title, description, status, created_at, latitude, longitude"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <ReportsTable reports={reports ?? []} />;
}
