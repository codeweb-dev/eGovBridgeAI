/**
 * Section marker: the logo's three colors as a rule, then a mono label that
 * matches the header nav wording so you always know where you are.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="flex h-1 w-10 overflow-hidden rounded-full">
        <span className="flex-1 bg-primary" />
        <span className="flex-1 bg-brand-gold" />
        <span className="flex-1 bg-brand-red" />
      </span>
      <span className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        {children}
      </span>
    </div>
  );
}
