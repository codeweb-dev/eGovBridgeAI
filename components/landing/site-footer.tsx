export function SiteFooter() {
  return (
    <footer className="overflow-hidden px-6 pt-10 pb-6">
      {/* ponytail: plain text + bg-clip-text, no SVG or image */}
      <p
        aria-hidden
        className="bg-linear-to-b from-foreground/10 to-foreground/30 bg-clip-text py-8 text-center text-[13.5vw] leading-[0.85] font-bold tracking-tight whitespace-nowrap text-transparent select-none"
      >
        eGovBridgeAI
      </p>
      <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} eGovBridgeAI. All rights reserved.
        </p>
        <nav className="flex items-center gap-6 font-medium">
          <a href="#" className="hover:text-foreground">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground">
            Cookie Policy
          </a>
        </nav>
      </div>
    </footer>
  );
}
