"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function stopSpeaking() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/** Speech synthesis reads plain text, so flatten the markdown first. */
function speakable(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => stopSpeaking, []);

  function toggle() {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(speakable(text));
    utterance.lang = navigator.language || "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={speaking ? "Stop reading" : "Read answer aloud"}
    >
      {speaking ? (
        <Square className="size-3.5" />
      ) : (
        <Volume2 className="size-3.5" />
      )}
    </Button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Copy answer"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
