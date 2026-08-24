import { db } from "@/lib/db";
import { PlanEditor } from "@/components/admin/plan-editor";

export default async function AdminPlansPage() {
  const plans = await db.plan.findMany({ orderBy: { priceMonthly: "asc" } });
  const subscriberCounts = await db.subscription.groupBy({ by: ["planId"], _count: true });
  const countByPlanId = Object.fromEntries(subscriberCounts.map((s) => [s.planId, s._count]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Plans & pricing</h1>
        <p className="mt-1 text-sm text-ink-500">Configure pricing, limits, and features for every plan on the platform.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {plans.map((plan) => (
          <PlanEditor
            key={plan.id}
            plan={{
              id: plan.id,
              key: plan.key,
              name: plan.name,
              priceMonthly: plan.priceMonthly,
              priceYearly: plan.priceYearly,
              isActive: plan.isActive,
              stripePriceId: plan.stripePriceId,
              limits: plan.limits as Record<string, number>,
              features: plan.features as string[],
            }}
            subscriberCount={countByPlanId[plan.id] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
