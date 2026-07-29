import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 py-1 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 py-2">
        <Logo />
        <nav className="hidden items-center gap-7 text-xs font-medium text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground">
            How it Works
          </a>
          <a href="#security" className="hover:text-foreground">
            Security
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link href="/login" className={buttonVariants()}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
