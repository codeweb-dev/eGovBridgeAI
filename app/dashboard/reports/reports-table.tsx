"use client";

import { useState } from "react";
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

export function ReportsTable({ reports }: { reports: Report[] }) {
  const [selected, setSelected] = useState<Report | null>(null);

  if (reports.length === 0) {
    return <p className="text-muted-foreground">You haven&apos;t submitted any reports yet.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.id}
              className="cursor-pointer"
              onClick={() => setSelected(report)}
            >
              <TableCell>{report.title}</TableCell>
              <TableCell>{report.category}</TableCell>
              <TableCell>
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  Case number: {selected.report_api_id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Category:</span> {selected.category}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <StatusBadge status={selected.status} />
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {selected.description}
                  </p>
                </div>
                <div className="text-muted-foreground">
                  Submitted {new Date(selected.created_at).toLocaleString()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
