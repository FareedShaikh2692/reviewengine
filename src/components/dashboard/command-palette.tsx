"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Send,
  Megaphone,
  Workflow,
  Star,
  Sparkles,
  MapPin,
  UsersRound,
  Settings,
  UserPlus,
  Plus,
  Search,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, group: "Navigate" },
  { label: "Customers", href: "/dashboard/customers", icon: Users, group: "Navigate" },
  { label: "Review Requests", href: "/dashboard/review-requests", icon: Send, group: "Navigate" },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone, group: "Navigate" },
  { label: "Automations", href: "/dashboard/automations", icon: Workflow, group: "Navigate" },
  { label: "Reviews", href: "/dashboard/reviews", icon: Star, group: "Navigate" },
  { label: "AI Insights", href: "/dashboard/insights", icon: Sparkles, group: "Navigate" },
  { label: "Locations", href: "/dashboard/locations", icon: MapPin, group: "Navigate" },
  { label: "Team", href: "/dashboard/team", icon: UsersRound, group: "Navigate" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, group: "Navigate" },
  { label: "Add Customer", href: "/dashboard/customers/new", icon: UserPlus, group: "Quick actions" },
  { label: "New Campaign", href: "/dashboard/campaigns/new", icon: Plus, group: "Quick actions" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(
    () => ITEMS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-ink-500 shadow-sm transition hover:bg-surface-muted"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0">
          <div className="border-b border-border p-3">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to a page or action…"
              className="border-none shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-400">No matches</p>}
            {filtered.map((item) => (
              <button
                key={item.href}
                onClick={() => go(item.href)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-surface-muted hover:text-ink-900"
              >
                <item.icon className="h-4 w-4 text-ink-400" />
                {item.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
