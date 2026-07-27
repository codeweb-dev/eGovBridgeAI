import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "./actions";
import { NavLinks } from "./nav-links";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center gap-4 border-b px-4 py-3">
        <Link href="/dashboard" className="shrink-0 text-lg font-bold tracking-tight">
          eGov<span className="text-primary">Bridge</span>AI
        </Link>
        <NavLinks />
        <form action={logout} className="ml-auto shrink-0">
          <Button variant="ghost" size="sm" type="submit">
            <LogOut />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </form>
      </header>
      {children}
    </div>
  );
}
