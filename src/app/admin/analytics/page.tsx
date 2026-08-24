import { db } from "@/lib/db";
import { Card } from "@/components/ui/glass-card";
import { AdminCharts } from "@/components/admin/admin-charts";

export default async function AdminAnalyticsPage() {
  const businesses = await db.business.findMany({ select: { industry: true, createdAt: true } });

  const byIndustry = new Map<string, number>();
  for (const b of businesses) {
    const key = b.industry || "Other";
    byIndustry.set(key, (byIndustry.get(key) ?? 0) + 1);
  }
  const industryData = [...byIndustry.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const growthByDay = new Map<string, number>();
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    growthByDay.set(date.toISOString().slice(5, 10), 0);
  }
  const orgs = await db.organization.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  for (const o of orgs) {
    const key = o.createdAt.toISOString().slice(5, 10);
    if (growthByDay.has(key)) growthByDay.set(key, (growthByDay.get(key) ?? 0) + 1);
  }
  const growthData = [...growthByDay.entries()].map(([date, count]) => ({ date, count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Platform analytics</h1>
        <p className="mt-1 text-sm text-ink-500">Business distribution and signup growth.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-ink-900">Businesses by industry</h2>
          <AdminCharts.Industry data={industryData} />
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-ink-900">Signup growth (last 30 days)</h2>
          <AdminCharts.Growth data={growthData} />
        </Card>
      </div>
    </div>
  );
}
