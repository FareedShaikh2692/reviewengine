"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { DASHBOARD_NAV } from "./nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2 px-6 font-semibold text-ink-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        Review Engine
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {DASHBOARD_NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-gradient text-white shadow-premium" : "text-ink-500 hover:bg-surface-muted hover:text-ink-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
