"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Activity, BarChart3, Search, HeartPulse, ScrollText, ShieldAlert, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/search", label: "Search", icon: Search },
  { href: "/admin/system-health", label: "System Health", icon: HeartPulse },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2 px-6 font-semibold text-ink-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 text-white">
          <ShieldAlert className="h-4 w-4" />
        </span>
        Super Admin
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-gradient-to-r from-rose-500 to-orange-400 text-white" : "text-ink-500 hover:bg-surface-muted hover:text-ink-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Link href="/dashboard" className="text-xs text-ink-500 hover:text-ink-900">
          ← Exit to product
        </Link>
      </div>
    </aside>
  );
}
