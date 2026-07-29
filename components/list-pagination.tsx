"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ListPagination({
  page,
  pageCount,
  onPageChange,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <p className="text-sm text-muted-foreground">
        Page {page + 1} of {pageCount}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={page >= pageCount - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
