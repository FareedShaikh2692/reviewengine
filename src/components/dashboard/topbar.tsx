"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronsUpDown, LogOut, Settings, Check, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter, type NotificationSummary } from "@/components/dashboard/notification-center";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { initials, cn } from "@/lib/utils";

export type TopbarOrg = { id: string; name: string; role: string };

export function Topbar({
  orgs,
  currentOrgId,
  userName,
  userEmail,
  unreadCount,
  recentNotifications,
}: {
  orgs: TopbarOrg[];
  currentOrgId: string;
  userName: string;
  userEmail: string;
  unreadCount: number;
  recentNotifications: NotificationSummary[];
}) {
  const router = useRouter();
  const current = orgs.find((o) => o.id === currentOrgId);

  async function switchOrg(id: string) {
    if (id === currentOrgId) return;
    await fetch("/api/org/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: id }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-ink-900 shadow-sm transition hover:bg-surface-muted">
              <Building2 className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="truncate">{current?.name ?? "Select organization"}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-ink-400" />
            </button>
          </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Your organizations</DropdownMenuLabel>
          {orgs.map((org) => (
            <DropdownMenuItem key={org.id} onSelect={() => switchOrg(org.id)}>
              <span className={cn("flex-1", org.id === currentOrgId && "font-semibold text-ink-900")}>{org.name}</span>
              {org.id === currentOrgId && <Check className="h-3.5 w-3.5 text-brand-mid" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <CommandPalette />
        <NotificationCenter unreadCount={unreadCount} notifications={recentNotifications} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
              {initials(userName || userEmail)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium text-ink-900">{userName}</p>
              <p className="font-normal text-ink-400">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-3.5 w-3.5" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
