import { Bell } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/states";
import { NotificationsList } from "@/components/dashboard/notifications/notifications-list";

export default async function NotificationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const notifications = await db.notification.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Notifications</h1>
        <p className="mt-1 text-sm text-ink-500">Stay on top of reviews, campaigns, and account activity.</p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <NotificationsList
          notifications={notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            isRead: n.isRead,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
