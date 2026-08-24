"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type NotificationSummary = { id: string; title: string; body: string; isRead: boolean; createdAt: string };

export function NotificationCenter({ unreadCount, notifications }: { unreadCount: number; notifications: NotificationSummary[] }) {
  const router = useRouter();

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    router.refresh();
  }

  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <Badge variant="danger" className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-1 pb-1">
          <DropdownMenuLabel className="px-1.5 py-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-brand-mid hover:underline">
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 && <p className="px-2.5 py-4 text-center text-xs text-ink-400">No notifications yet</p>}
        {notifications.map((n) => (
          <DropdownMenuItem key={n.id} onSelect={() => !n.isRead && markRead(n.id)} className="flex-col items-start gap-0.5 whitespace-normal">
            <span className={cn("flex items-center gap-1.5 text-sm font-medium", n.isRead ? "text-ink-700" : "text-ink-900")}>
              {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-mid" />}
              {n.title}
            </span>
            <span className="text-xs text-ink-500">{n.body}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="justify-center text-xs font-medium text-brand-mid">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
