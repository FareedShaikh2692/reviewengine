import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { BusinessRowActions } from "@/components/admin/business-row-actions";

export default async function AdminBusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const org = await db.organization.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      businesses: { include: { locations: true } },
      subscription: { include: { plan: true } },
    },
  });
  if (!org) notFound();

  const auditLogs = await db.auditLog.findMany({ where: { organizationId: id }, orderBy: { createdAt: "desc" }, take: 30 });

  return (
    <div className="space-y-6">
      <Link href="/admin/businesses" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to businesses
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{org.name}</h1>
          <p className="mt-1 text-sm text-ink-500">{org.industry} · {org.slug}</p>
        </div>
        <BusinessRowActions orgId={org.id} status={org.status} currentPlanKey={org.subscription?.plan.key ?? "FREE"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-ink-900">Members</h2>
          <div className="mt-4 space-y-2">
            {org.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-sm">
                <span className="text-ink-900">{m.user.name || m.user.email}</span>
                <Badge variant="outline">{m.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-ink-900">Businesses & locations</h2>
          <div className="mt-4 space-y-2">
            {org.businesses.map((b) => (
              <div key={b.id} className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
                <p className="font-medium text-ink-900">{b.name}</p>
                <p className="text-xs text-ink-500">{b.locations.length} location(s)</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-ink-900">Recent activity</h2>
        <div className="mt-4 space-y-2">
          {auditLogs.length === 0 && <p className="text-sm text-ink-500">No activity recorded yet.</p>}
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
              <span className="text-ink-700">{log.action.replace(/_/g, " ")}</span>
              <span className="text-ink-400">{log.createdAt.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
