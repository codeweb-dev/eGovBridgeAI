"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          <p>{error.message || "An unexpected error occurred."}</p>
          <Button variant="outline" size="sm" onClick={reset} className="mt-3">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}
