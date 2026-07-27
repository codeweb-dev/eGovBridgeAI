import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  Completed: "border-green-600 text-green-600 dark:border-green-400 dark:text-green-400",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "outline"> = {
  Pending: "secondary",
  Processing: "default",
  Completed: "outline",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"} className={STATUS_STYLES[status]}>
      {status}
    </Badge>
  );
}
