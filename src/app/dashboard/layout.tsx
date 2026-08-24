import { redirect } from "next/navigation";
import { getOrgContext, getSessionUser, listUserOrganizations } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?callbackUrl=/dashboard");

  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/business");

  const [memberships, unreadCount, recentNotifications] = await Promise.all([
    listUserOrganizations(user.id),
    db.notification.count({ where: { organizationId: ctx.organizationId, isRead: false } }),
    db.notification.findMany({ where: { organizationId: ctx.organizationId }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          orgs={memberships.map((m) => ({ id: m.organizationId, name: m.organization.name, role: m.role }))}
          currentOrgId={ctx.organizationId}
          userName={user.name ?? ctx.userEmail}
          userEmail={ctx.userEmail}
          unreadCount={unreadCount}
          recentNotifications={recentNotifications.map((n) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            isRead: n.isRead,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
