import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { BusinessRowActions } from "@/components/admin/business-row-actions";

export default async function AdminBusinessesPage() {
  const orgs = await db.organization.findMany({
    include: {
      members: { where: { role: "OWNER" }, include: { user: true }, take: 1 },
      businesses: { include: { locations: true } },
      subscription: { include: { plan: true } },
      _count: { select: { customers: true, campaigns: true, reviewRequests: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Businesses</h1>
        <p className="mt-1 text-sm text-ink-500">{orgs.length.toLocaleString()} organizations on the platform.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-premium">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Industry</th>
                <th className="px-5 py-3">Locations</th>
                <th className="px-5 py-3">Customers</th>
                <th className="px-5 py-3">Campaigns</th>
                <th className="px-5 py-3">Requests</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                  <td className="px-5 py-3.5 font-medium text-ink-900">{org.name}</td>
                  <td className="px-5 py-3.5 text-ink-500">{org.members[0]?.user.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-ink-500">{org.industry ?? "—"}</td>
                  <td className="px-5 py-3.5 text-ink-500">{org.businesses.reduce((s, b) => s + b.locations.length, 0)}</td>
                  <td className="px-5 py-3.5 text-ink-500">{org._count.customers}</td>
                  <td className="px-5 py-3.5 text-ink-500">{org._count.campaigns}</td>
                  <td className="px-5 py-3.5 text-ink-500">{org._count.reviewRequests}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline">{org.subscription?.plan.name ?? "Free"}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={org.status === "ACTIVE" ? "success" : "danger"}>{org.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-ink-500">{org.createdAt.toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <BusinessRowActions orgId={org.id} status={org.status} currentPlanKey={org.subscription?.plan.key ?? "FREE"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
