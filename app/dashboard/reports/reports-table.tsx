"use client";

import { useState } from "react";
import Link from "next/link";
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
import { ArrowUpDown, ClipboardList, Plus, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";

export interface Report {
  id: string;
  report_api_id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

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
];

export function ReportsTable({ reports }: { reports: Report[] }) {
  const [selected, setSelected] = useState<Report | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

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
          File your first report and follow it here by reference number.
        </p>
        <Link
          href="/dashboard/report/new"
          className={buttonVariants({ className: "mt-6" })}
        >
          <Plus className="size-4" />
          Submit a report
        </Link>
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="tracking-tight">
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs tracking-wider">
                  {selected.report_api_id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-muted/50 px-4 py-3">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      Category
                    </p>
                    <p className="mt-1 font-medium">{selected.category}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      Status
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      Submitted
                    </p>
                    <p className="mt-1 font-medium">
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {selected.description}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
