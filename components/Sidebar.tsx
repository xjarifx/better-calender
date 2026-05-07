"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  List,
  Sparkles,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Calendar", icon: Calendar, href: "/calendar" },
  { label: "AI Input", icon: Sparkles, href: "/events/input" },
  { label: "Events", icon: List, href: "/events" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const { isAuthenticated, username, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) return null;

  // Find all nav items matching current path (exact or child route)
  const matchingItems = navItems.filter(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/"),
  );
  // Select the most specific match (longest href)
  const activeHref =
    matchingItems.length > 0
      ? matchingItems.sort((a, b) => b.href.length - a.href.length)[0].href
      : null;
  const isActive = (href: string) => href === activeHref;

  const usernameInitial = username?.charAt(0).toUpperCase() || "U";

  return (
    <aside
      data-tour="sidebar"
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300",
        isCollapsed ? "sidebar-collapsed w-16" : "w-64",
      )}
    >
      <div className="border-b border-border px-4 py-4">
        <Link
          href="/calendar"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <Calendar className="h-5 w-5 text-primary" />
          {!isCollapsed && <span>Better Calendar</span>}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-10 items-center rounded-lg px-3 text-sm transition-colors",
              isCollapsed ? "justify-center" : "gap-3",
              isActive(item.href)
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
            title={item.label}
            aria-label={item.label}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <div
          className={cn(
            "mb-2 flex items-center rounded-lg px-2 py-2",
            isCollapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
            {usernameInitial}
          </div>
          {!isCollapsed && (
            <span className="truncate text-sm text-foreground">{username}</span>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={logout}
          className={cn(
            "mb-2 h-9 w-full text-muted-foreground hover:text-foreground",
            isCollapsed ? "justify-center" : "justify-start gap-2",
          )}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={cn(
            "h-9 w-full",
            isCollapsed ? "justify-center" : "justify-start gap-2",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {!isCollapsed && <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
