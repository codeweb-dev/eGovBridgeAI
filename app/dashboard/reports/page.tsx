import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/landing/eyebrow";
import { ReportsList } from "./reports-list";
import { ReportsSkeleton } from "./reports-skeleton";

export default async function ReportsPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>My Reports</Eyebrow>
          <h1 className="mt-5 text-3xl font-bold tracking-tighter">
            Everything you&apos;ve filed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track status by reference number. Click a row for the full details.
          </p>
        </div>
        <Link href="/dashboard/report/new" className={buttonVariants()}>
          <Plus className="size-4" />
          Submit Report
        </Link>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsList userId={userId} />
      </Suspense>
    </div>
  );
}
