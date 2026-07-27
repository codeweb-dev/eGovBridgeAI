"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { summarizeDocument } from "./actions";

export function Summarizer() {
  const [document, setDocument] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSummarize() {
    if (!document.trim()) return;
    setLoading(true);
    try {
      setSummary(await summarizeDocument(document));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to summarize document.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paste a document</CardTitle>
          <CardDescription>Paste the full text of a government document to summarize.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            rows={12}
            placeholder="Paste document text here…"
          />
          <Button onClick={handleSummarize} disabled={loading || !document.trim()}>
            {loading ? "Summarizing…" : "Summarize"}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
