import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { isMock } from "@/lib/env";
import { BillingPlans } from "@/components/dashboard/settings/billing-plans";

export default async function BillingSettingsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const [subscription, plans, customerCount, requestCount, businessCount] = await Promise.all([
    db.subscription.findUnique({ where: { organizationId: ctx.organizationId }, include: { plan: true } }),
    db.plan.findMany({ orderBy: { priceMonthly: "asc" } }),
    db.customer.count({ where: { organizationId: ctx.organizationId } }),
    db.reviewRequest.count({ where: { organizationId: ctx.organizationId } }),
    db.business.count({ where: { organizationId: ctx.organizationId } }),
  ]);

  const limits = (subscription?.plan.limits as Record<string, number>) ?? {};

  return (
    <div className="space-y-6">
      {isMock.billing && <Badge variant="warning">Dev billing mode — no real charges, connect Stripe to go live</Badge>}

      <Card className="max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-ink-400">Current plan</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{subscription?.plan.name ?? "Free"}</p>
          </div>
          <Badge variant={subscription?.status === "ACTIVE" ? "success" : "warning"}>{subscription?.status ?? "NONE"}</Badge>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Usage label="Businesses" used={businessCount} limit={limits.businesses} />
          <Usage label="Customers" used={customerCount} limit={limits.customers} />
          <Usage label="Review requests" used={requestCount} limit={limits.reviewRequests} />
        </div>
      </Card>

      <BillingPlans plans={plans} currentPlanKey={subscription?.plan.key ?? "FREE"} />
    </div>
  );
}

function Usage({ label, used, limit }: { label: string; used: number; limit?: number }) {
  const unlimited = limit === undefined || limit < 0;
  const pct = unlimited ? 0 : Math.min((used / Math.max(limit, 1)) * 100, 100);
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink-900">
        {used.toLocaleString()} {!unlimited && `/ ${limit.toLocaleString()}`}
        {unlimited && " (unlimited)"}
      </p>
      {!unlimited && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
