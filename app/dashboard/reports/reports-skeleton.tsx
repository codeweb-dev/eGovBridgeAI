import { Skeleton } from "@/components/ui/skeleton";

export function ReportsSkeleton() {
  return (
    <>
      <Skeleton className="h-9 max-w-sm" />
      <div className="space-y-px overflow-hidden rounded-2xl border">
        <Skeleton className="h-10 w-full rounded-none" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-none" />
        ))}
      </div>
    </>
  );
}
