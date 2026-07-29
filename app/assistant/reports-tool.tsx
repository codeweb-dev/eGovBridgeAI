"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronDown,
  ClipboardList,
  ExternalLink,
  MapPin,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ListPagination } from "@/components/list-pagination";
import { paginate } from "@/lib/pagination";
import { reportMatchesSearch } from "@/lib/report-search";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/app/dashboard/reports/status-badge";
import type { Report } from "@/app/dashboard/reports/reports-table";
import type { PinnedReport } from "@/components/reports-map";
import { Reasoning, ToolHeader, type ReasoningStep } from "./tool-card";
import { listMyReports } from "./actions";

// Leaflet touches `window` on import, so it can only load in the browser.
const ReportsMap = dynamic(() => import("@/components/reports-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full rounded-none" />,
});

export type ReportsMode = "list" | "search" | "map";

const TOOL_NAMES: Record<ReportsMode, string> = {
  list: "list_reports",
  search: "search_reports",
  map: "map_reports",
};

/**
 * Reads the same rows as My Reports, inline in the chat. Search filters what's
 * already loaded — a user's report list is small enough that a round trip per
 * keystroke would be the slower option.
 */
export function ReportsTool({
  mode,
  initialQuery = "",
  onFileReport,
}: {
  mode: ReportsMode;
  initialQuery?: string;
  onFileReport?: () => void;
}) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [requestedPage, setRequestedPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    listMyReports()
      .then(setReports)
      .catch(() => toast.error("Failed to load your reports."))
      .finally(() => setLoading(false));
  }, []);

  const matches = useMemo(() => {
    return reports.filter((report) => reportMatchesSearch(report, query));
  }, [reports, query]);
  const pagination = paginate(matches, requestedPage);

  const pinned = useMemo(
    () =>
      reports.filter(
        (r): r is PinnedReport => r.latitude !== null && r.longitude !== null,
      ),
    [reports],
  );

  const plural = (n: number) => `${n} report${n === 1 ? "" : "s"}`;

  const steps: ReasoningStep[] = [
    {
      label: "Reading the reports filed under your account",
      status: loading ? "running" : "done",
    },
    loading
      ? { label: "Counting what came back", status: "pending" }
      : { label: `Found ${plural(reports.length)}`, status: "done" },
  ];
  if (!loading && mode === "search") {
    steps.push(
      query.trim()
        ? {
            label: `${plural(matches.length)} match “${query.trim()}”`,
            status: "done",
          }
        : { label: "Waiting for a search term", status: "pending" },
    );
  }
  if (!loading && mode === "map") {
    steps.push({
      label: `${plural(pinned.length)} carry a pinned location`,
      status: pinned.length ? "done" : "pending",
    });
  }

  return (
    <div className="w-full space-y-3">
      <Reasoning steps={steps} />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <ToolHeader
          name={TOOL_NAMES[mode]}
          status={loading ? "running" : "done"}
          label={
            loading
              ? "reading…"
              : mode === "map"
                ? `${pinned.length} pinned`
                : `${matches.length} of ${reports.length}`
          }
        />

        {mode === "search" && !loading && reports.length > 0 && (
          <div className="relative border-b p-3">
            <Search className="absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setRequestedPage(0);
              }}
              placeholder="Search any report information…"
              className="pl-9"
            />
          </div>
        )}

        {loading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <ClipboardList className="size-6 text-primary" />
            <p className="mt-4 font-medium tracking-tight">Nothing filed yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Once you file a report it shows up here with its reference number.
            </p>
            {onFileReport && (
              <Button size="sm" className="mt-5" onClick={onFileReport}>
                File one now
              </Button>
            )}
          </div>
        ) : mode === "map" ? (
          pinned.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <MapPin className="size-6 text-primary" />
              <p className="mt-4 font-medium tracking-tight">
                No pinned locations
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Reports only appear on the map when a spot was pinned while
                filing them.
              </p>
            </div>
          ) : (
            // ponytail: no clustering — cluster when someone files enough
            // reports in one spot for the pins to overlap.
            <ReportsMap
              reports={pinned}
              className="z-0 h-72 min-h-0 rounded-none"
            />
          )
        ) : matches.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul className="divide-y">
            {pagination.items.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  aria-expanded={openId === r.id}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] tracking-wider text-muted-foreground">
                      {r.report_api_id} · {r.category}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                  <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      openId === r.id && "rotate-180",
                    )}
                  />
                </button>
                {openId === r.id && (
                  <p className="px-4 pb-4 text-sm whitespace-pre-wrap text-muted-foreground">
                    {r.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {mode !== "map" && matches.length > 0 && (
          <ListPagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={setRequestedPage}
            className="border-t bg-muted/20 px-4 py-2.5"
          />
        )}

        {reports.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-2.5">
            <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {mode === "map"
                ? "Tap a pin for details"
                : "Tap a row for details"}
            </span>
            <Link
              href="/dashboard/reports"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Open My Reports
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
