"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Bot,
  MapPinned,
  Sparkles,
  LogOut,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { adminLogout, logout } from "./actions";
import Image from "next/image";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  // ponytail: not in the nav — you reach it from the My Reports button
  {
    href: "/dashboard/report/new",
    label: "Submit Report",
    icon: FileText,
    hidden: true,
  },
  { href: "/dashboard/reports", label: "My Reports", icon: ClipboardList },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  {
    href: "/dashboard/summarize",
    label: "Document Summarizer",
    icon: Sparkles,
  },
];

const adminLinks = [
  {
    href: "/admin",
    label: "Admin Dashboard",
    icon: LayoutDashboard,
    hidden: false,
  },
  {
    href: "/admin/reports",
    label: "All Reports",
    icon: ClipboardList,
    hidden: false,
  },
  {
    href: "/admin/map",
    label: "Reports Map",
    icon: MapPinned,
    hidden: false,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    hidden: false,
  },
];

/** Header label for the current section, so the top bar isn't just a trigger. */
export function PageTitle() {
  const pathname = usePathname();
  const current = [...links, ...adminLinks].find((l) => l.href === pathname);
  return (
    <span className="truncate text-sm font-medium">
      {current?.label ?? "Dashboard"}
    </span>
  );
}

export function AppSidebar({
  name,
  phone,
  initials,
  admin = false,
}: {
  name: string;
  phone: string;
  initials: string;
  admin?: boolean;
}) {
  const pathname = usePathname();
  const navLinks = admin ? adminLinks : links;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={admin ? "/admin" : "/dashboard"} />}
            >
              {/* The logo's three colors, same mark the landing page uses. */}
              <span
                aria-hidden
                className="flex aspect-square size-8 shrink-0 flex-col justify-center gap-[3px] rounded-lg bg-primary px-2"
              >
                <span className="h-[3px] rounded-full bg-primary-foreground" />
                <span className="h-[3px] rounded-full bg-brand-gold" />
                <span className="h-[3px] w-2/3 rounded-full bg-brand-red" />
              </span>
              <Image
                src="/logo.png"
                alt="eGovBridgeAI"
                width={100}
                height={50}
                priority
                className="h-auto w-auto"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
            {admin ? "Administration" : "Services"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks
                .filter((l) => !l.hidden)
                .map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={pathname === href}
                      tooltip={label}
                      render={<Link href={href} />}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">
                  {initials || <User className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {phone}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={admin ? adminLogout : logout}>
              <SidebarMenuButton type="submit" tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
