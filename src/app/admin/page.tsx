import { Building2, Users, Send, Star, Megaphone, DollarSign, Activity as ActivityIcon, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/stat-card";

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalBusinesses,
    activeBusinesses,
    newBusinessesToday,
    totalCustomers,
    requestsSent,
    reviewsGenerated,
    activeCampaigns,
    subscriptions,
  ] = await Promise.all([
    db.business.count(),
    db.business.count({ where: { organization: { status: "ACTIVE" } } }),
    db.business.count({ where: { createdAt: { gte: startOfToday } } }),
    db.customer.count(),
    db.reviewRequest.count(),
    db.review.count(),
    db.campaign.count({ where: { status: "RUNNING" } }),
    db.subscription.findMany({ where: { status: "ACTIVE" }, include: { plan: true } }),
  ]);

  const mrr = subscriptions.reduce((sum, s) => sum + s.plan.priceMonthly, 0) / 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Platform overview</h1>
        <p className="mt-1 text-sm text-ink-500">Real-time metrics across every tenant on Review Engine.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Businesses" value={totalBusinesses.toLocaleString()} icon={Building2} />
        <StatCard label="Active Businesses" value={activeBusinesses.toLocaleString()} icon={TrendingUp} />
        <StatCard label="New Businesses Today" value={newBusinessesToday.toLocaleString()} icon={ActivityIcon} />
        <StatCard label="Total Customers" value={totalCustomers.toLocaleString()} icon={Users} />
        <StatCard label="Review Requests Sent" value={requestsSent.toLocaleString()} icon={Send} />
        <StatCard label="Reviews Generated" value={reviewsGenerated.toLocaleString()} icon={Star} />
        <StatCard label="Active Campaigns" value={activeCampaigns.toLocaleString()} icon={Megaphone} />
        <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} />
      </div>
    </div>
  );
}
