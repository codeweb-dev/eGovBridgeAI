import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ReportsList } from "./reports-list";
import { ReportsSkeleton } from "./reports-skeleton";

export default async function ReportsPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">My Reports</h1>
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsList userId={userId} />
      </Suspense>
    </main>
  );
}
