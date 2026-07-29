import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Eyebrow } from "@/components/landing/eyebrow";
import {
  ReportsTable,
  type Report,
} from "@/app/dashboard/reports/reports-table";

export default async function AdminReportsPage() {
  await requireAdmin();

  async function updateStatus(
    id: string,
    status: "Processing" | "Completed",
  ) {
    "use server";

    await requireAdmin();
    if (status !== "Processing" && status !== "Completed") {
      throw new Error("Invalid report status.");
    }

    const { error } = await getSupabaseAdmin()
      .from("reports")
      .update({ status })
      .eq("id", id)
      .select("id")
      .single();

    if (error) throw new Error("Failed to update the report status.");
    revalidatePath("/admin/reports");
    revalidatePath("/admin");
  }

  const { data: rows } = await getSupabaseAdmin()
    .from("reports")
    .select(
      "id, report_api_id, category, title, description, status, created_at, latitude, longitude, reporter:users(full_name, email, phone)",
    )
    .order("created_at", { ascending: false });

  const reports: Report[] = (rows ?? []).map(({ reporter, ...report }) => {
    const person = (
      Array.isArray(reporter) ? reporter[0] : reporter
    ) as {
      full_name: string | null;
      email: string | null;
      phone: string | null;
    } | null;

    return {
      ...report,
      reporter:
        person?.full_name ||
        person?.email ||
        person?.phone ||
        "Unknown user",
      searchText: [person?.full_name, person?.email, person?.phone]
        .filter(Boolean)
        .join(" "),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
      <div>
        <Eyebrow>Administration</Eyebrow>
        <h1 className="mt-5 text-3xl font-bold tracking-tighter">
          All reports
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search every citizen report, review its details, and update its
          status.
        </p>
      </div>
      <ReportsTable
        reports={reports}
        readOnly
        updateStatusAction={updateStatus}
      />
    </div>
  );
}
