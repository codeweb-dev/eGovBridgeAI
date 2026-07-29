"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CalendarDays,
  ClipboardList,
  Copy,
  Eye,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { LatLng } from "@/components/location-map";
import { StatusBadge } from "./status-badge";
import { deleteReport, updateReport } from "./actions";

export interface Report {
  id: string;
  report_api_id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  reporter?: string;
}

const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
});

function buildColumns(
  actions: {
    onView: (report: Report) => void;
    onEdit: (report: Report) => void;
    onDelete: (report: Report) => void;
  },
  readOnly = false,
): ColumnDef<Report>[] {
  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: "title",
      header: "Report",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.title}</p>
          <p className="truncate font-mono text-[11px] tracking-wider text-muted-foreground">
            {row.original.report_api_id}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.category}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-7"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      // Row clicks open the view too — these are the discoverable version.
      cell: ({ row }) => (
        <div
          className="flex items-center justify-end gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`View ${row.original.title}`}
            onClick={() => actions.onView(row.original)}
          >
            <Eye className="size-3.5" />
          </Button>
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${row.original.title}`}
                onClick={() => actions.onEdit(row.original)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${row.original.title}`}
                className="text-muted-foreground hover:text-destructive"
                onClick={() => actions.onDelete(row.original)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (readOnly) {
    columns.splice(1, 0, {
      accessorKey: "reporter",
      header: "Reporter",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.reporter}</span>
      ),
    });
  }

  return columns;
}

export function ReportsTable({
  reports,
  readOnly = false,
}: {
  reports: Report[];
  readOnly?: boolean;
}) {
  const [selected, setSelected] = useState<Report | null>(null);
  const [editing, setEditing] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState<Report | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () =>
      buildColumns(
        {
          onView: setSelected,
          onEdit: setEditing,
          onDelete: setDeleting,
        },
        readOnly,
      ),
    [readOnly],
  );

  const table = useReactTable({
    data: reports,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
        <ClipboardList className="size-6 text-primary" />
        <p className="mt-4 font-semibold tracking-tight">No reports yet</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {readOnly
            ? "No citizen reports have been submitted."
            : "File your first report and follow it here by reference number."}
        </p>
        {!readOnly && (
          <Link
            href="/dashboard/report/new"
            className={buttonVariants({ className: "mt-6" })}
          >
            <Plus className="size-4" />
            Submit a report
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search reports…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No reports match &ldquo;{globalFilter}&rdquo;.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[calc(100svh-2rem)] max-w-4xl! overflow-y-auto p-0">
          {selected && (
            <>
              <DialogHeader className="border-b bg-linear-to-br from-primary/10 via-background to-background px-6 pt-6 pr-14 pb-5">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={selected.status} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {selected.category}
                      </span>
                    </div>
                    <DialogTitle className="text-xl leading-tight font-semibold tracking-tight">
                      {selected.title}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs tracking-wider">
                      Reference {selected.report_api_id}
                    </DialogDescription>
                    {selected.reporter && (
                      <p className="text-xs text-muted-foreground">
                        Reported by {selected.reporter}
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 p-6 text-sm">
                <div className="min-w-0 flex-1 space-y-6">
                  <section>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      Description
                    </p>
                    <p className="mt-2 whitespace-pre-wrap leading-6 text-muted-foreground">
                      {selected.description || "No description provided."}
                    </p>
                  </section>
                  <section className="space-y-2">
                    <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      <MapPin className="size-3.5" />
                      Location
                    </p>
                    {selected.latitude !== null &&
                    selected.longitude !== null ? (
                      <>
                        <LocationMap
                          value={[selected.latitude, selected.longitude]}
                          className="z-0 h-52 min-h-0 rounded-2xl border"
                        />
                        <p className="font-mono text-xs text-muted-foreground">
                          {selected.latitude.toFixed(5)},{" "}
                          {selected.longitude.toFixed(5)}
                        </p>
                      </>
                    ) : (
                      <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-xs text-muted-foreground">
                        No spot was pinned when this report was filed.
                      </p>
                    )}
                  </section>
                </div>
                <aside className="flex w-full sm:w-60 shrink-0 flex-col gap-4">
                  <div className="rounded-2xl border p-4">
                    <CalendarDays className="size-4 text-primary" />
                    <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      Submitted
                    </p>
                    <p className="mt-1 font-medium">
                      {new Date(selected.created_at).toLocaleDateString(
                        undefined,
                        { dateStyle: "medium" },
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selected.created_at).toLocaleTimeString(
                        undefined,
                        { timeStyle: "short" },
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-muted/30 p-4 text-center">
                    <div className="mx-auto w-fit rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                      <QRCodeSVG
                        value={selected.report_api_id}
                        size={128}
                        level="M"
                        marginSize={1}
                        title={`Reference ${selected.report_api_id}`}
                        className="size-28"
                      />
                    </div>
                    <p className="mt-3 font-medium">Scan reference</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Carries the case number for quick handoff.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full bg-background"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            selected.report_api_id,
                          );
                          toast.success("Reference copied.");
                        } catch {
                          toast.error("Could not copy the reference.");
                        }
                      }}
                    >
                      <Copy className="size-3.5" />
                      Copy
                    </Button>
                  </div>
                </aside>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {!readOnly && (
        <>
          <EditReportDialog
            key={editing?.id ?? "none"}
            report={editing}
            onClose={() => setEditing(null)}
          />
          <DeleteReportDialog
            report={deleting}
            onClose={() => setDeleting(null)}
          />
        </>
      )}
    </>
  );
}

function EditReportDialog({
  report,
  onClose,
}: {
  report: Report | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  // Keyed by report id upstream, so this mounts fresh per report.
  const [pin, setPin] = useState<LatLng | null>(
    report?.latitude != null && report?.longitude != null
      ? [report.latitude, report.longitude]
      : null,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!report) return;
    const data = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await updateReport(report.id, {
        title: String(data.get("title") ?? ""),
        description: String(data.get("description") ?? ""),
        latitude: pin?.[0] ?? null,
        longitude: pin?.[1] ?? null,
      });
      toast.success("Report updated.");
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={report !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {report && (
          // Keyed so the uncontrolled inputs reset when a different row opens.
          <form key={report.id} onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="tracking-tight">Edit report</DialogTitle>
              <DialogDescription>
                Updates your copy here. The agency keeps the case as filed under{" "}
                <span className="font-mono">{report.report_api_id}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={report.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                rows={4}
                defaultValue={report.description}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Location</Label>
                {pin && (
                  <button
                    type="button"
                    onClick={() => setPin(null)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Clear pin
                  </button>
                )}
              </div>
              <LocationMap
                value={pin}
                onChange={setPin}
                className="z-0 h-48 min-h-0 rounded-xl border"
              />
              <p className="text-xs text-muted-foreground">
                {pin ? (
                  <>
                    Pinned at{" "}
                    <span className="font-mono">
                      {pin[0].toFixed(5)}, {pin[1].toFixed(5)}
                    </span>
                  </>
                ) : (
                  "Click the map to add a pin — it shows up on the map view."
                )}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteReportDialog({
  report,
  onClose,
}: {
  report: Report | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    if (!report) return;
    setDeleting(true);
    try {
      await deleteReport(report.id);
      toast.success("Report removed from your list.");
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={report !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this report?</AlertDialogTitle>
          <AlertDialogDescription>
            “{report?.title}” disappears from your list. The agency still has
            case <span className="font-mono">{report?.report_api_id}</span> —
            this only removes your copy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={confirm}
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
