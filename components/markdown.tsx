"use client";

import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

// Streamdown ships its own Tailwind typography on these tags. Rendering each as
// the bare element leaves typeset as the only thing styling prose. Code blocks,
// tables and mermaid keep Streamdown's widgets.
const BARE = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  p: "p",
  a: "a",
  ul: "ul",
  ol: "ol",
  li: "li",
  blockquote: "blockquote",
  hr: "hr",
  strong: "strong",
  em: "em",
  del: "del",
  img: "img",
} as const;

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("typeset typeset-docs", className)}>
      {/* Streamdown hardcodes space-y-4, which outranks typeset's block margins.
          tw-merge swaps it for typeset's own rhythm value. */}
      <Streamdown className="space-y-[var(--typeset-flow)]" components={BARE}>
        {children}
      </Streamdown>
    </div>
  );
}
