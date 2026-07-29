"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Markdown } from "@/components/markdown";
import {
  CopyButton,
  SpeakButton,
  stopSpeaking,
} from "@/components/message-actions";
import { Reveal } from "@/components/landing/reveal";
import { summarizeDocument } from "./actions";

// One-shot API call — honest pacing labels, not real steps.
const THINKING = [
  "Reading the document",
  "Pulling out what matters",
  "Writing the summary",
];

const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

export function Summarizer() {
  const [document, setDocument] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceWords, setSourceWords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setPhase((p) => (p + 1) % THINKING.length),
      2600,
    );
    return () => clearInterval(id);
  }, [loading]);

  const words = countWords(document);

  async function handleSummarize() {
    if (!document.trim() || loading) return;
    stopSpeaking();
    setSummary("");
    setPhase(0);
    setLoading(true);
    try {
      setSummary(await summarizeDocument(document));
      setSourceWords(words);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to summarize document.",
      );
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    stopSpeaking();
    setDocument("");
    setSummary("");
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSummarize();
        }}
        className="rounded-2xl border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/40"
      >
        <div className="flex items-baseline justify-between gap-3 px-3 pt-3 pb-1">
          <span className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
            Document
          </span>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {words > 0 ? `${words.toLocaleString()} words` : ""}
          </span>
        </div>
        <Textarea
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          onKeyDown={(e) => {
            // Enter is a newline here — documents are multi-line.
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSummarize();
            }
          }}
          rows={10}
          placeholder="Paste the full text of a government document…"
          className="max-h-[50vh] resize-none border-0 bg-transparent px-3 py-1.5 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-2 px-3 pt-1 pb-1">
          <span className="text-[11px] text-muted-foreground">
            ⌘ / Ctrl + Enter to summarize
          </span>
          <div className="flex items-center gap-1">
            {document && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clear}
                disabled={loading}
                aria-label="Clear document"
              >
                <X className="size-4" />
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || !document.trim()}
              className="group"
            >
              {loading ? (
                <Spinner />
              ) : (
                <Sparkles className="size-4 transition-transform group-hover:scale-110" />
              )}
              Summarize
            </Button>
          </div>
        </div>
      </form>

      {loading && (
        <Marker role="status" className="px-1">
          <MarkerIcon>
            <Spinner />
          </MarkerIcon>
          <MarkerContent className="shimmer">{THINKING[phase]}…</MarkerContent>
        </Marker>
      )}

      {summary && !loading && (
        <Reveal>
          <section className="rounded-2xl border bg-card p-6">
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
                  Summary
                </span>
                <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {sourceWords.toLocaleString()} → {countWords(summary)} words
                </p>
              </div>
              <div className="-mr-2 flex items-center gap-1">
                <CopyButton text={summary} />
                <SpeakButton text={summary} />
              </div>
            </div>
            <Markdown>{summary}</Markdown>
          </section>
        </Reveal>
      )}
    </div>
  );
}
