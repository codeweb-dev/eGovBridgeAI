import { requireAdmin } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Eyebrow } from "@/components/landing/eyebrow";
import ReportsMap, { type PinnedReport } from "@/components/reports-map";

export default async function AdminReportsMapPage() {
  await requireAdmin();
  const { data: reports } = await getSupabaseAdmin()
    .from("reports")
    .select(
      "id, report_api_id, category, title, description, status, created_at, latitude, longitude",
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("created_at", { ascending: false });

  const pinned = (reports ?? []) as PinnedReport[];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
      <div>
        <Eyebrow>Administration</Eyebrow>
        <h1 className="mt-5 text-3xl font-bold tracking-tighter">
          Reports map
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {pinned.length} pinned {pinned.length === 1 ? "report" : "reports"}{" "}
          across the map.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <ReportsMap
          reports={pinned}
          className="z-0 h-[calc(100svh-16rem)] min-h-128 rounded-none"
        />
      </div>
    </div>
  );
}
