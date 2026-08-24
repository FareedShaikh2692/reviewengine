"use client";

import { useRouter } from "next/navigation";
import { Star, Megaphone, TrendingUp, AlertTriangle, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Bell> = {
  NEW_REVIEW: Star,
  CAMPAIGN_COMPLETED: Megaphone,
  RATING_CHANGE: TrendingUp,
};

type Notification = { id: string; type: string; title: string; body: string; isRead: boolean; createdAt: string };

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
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
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={markAllRead}>
          <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
        </Button>
      </div>
      {notifications.map((n) => {
        const Icon = ICONS[n.type] ?? AlertTriangle;
        return (
          <button
            key={n.id}
            onClick={() => !n.isRead && markRead(n.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-premium transition hover:-translate-y-0.5",
              !n.isRead && "ring-1 ring-brand-mid/30"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient/10">
              <Icon className="h-4 w-4" style={{ color: "var(--brand-mid)" }} />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-brand-mid" />}
              </div>
              <p className="mt-0.5 text-sm text-ink-500">{n.body}</p>
              <p className="mt-1 text-xs text-ink-400">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
