import { Star, Send, CheckCircle2, Percent, TrendingUp, CalendarDays } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { getOverviewStats, getReviewGrowthSeries, getRequestFunnel, getRatingDistribution } from "@/lib/dashboard-data";
import { StatCard } from "@/components/ui/stat-card";
import { ReviewGrowthChart } from "@/components/dashboard/charts/review-growth-chart";
import { RequestFunnelChart } from "@/components/dashboard/charts/request-funnel";
import { RatingDistributionCard } from "@/components/dashboard/charts/rating-distribution";

export default async function DashboardOverviewPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const [stats, series, funnel, distribution] = await Promise.all([
    getOverviewStats(ctx.organizationId),
    getReviewGrowthSeries(ctx.organizationId, 30),
    getRequestFunnel(ctx.organizationId),
    getRatingDistribution(ctx.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Overview</h1>
        <p className="mt-1 text-sm text-ink-500">Welcome back — here&apos;s how {ctx.organizationName} is doing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Reviews" value={stats.totalReviews.toLocaleString()} icon={Star} />
        <StatCard label="Average Rating" value={stats.averageRating.toFixed(1)} delta={stats.ratingDeltaPct} deltaLabel="vs last week" icon={TrendingUp} />
        <StatCard label="Review Requests" value={stats.totalRequests.toLocaleString()} icon={Send} />
        <StatCard label="Requests Completed" value={stats.completedRequests.toLocaleString()} icon={CheckCircle2} />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate.toFixed(0)}%`} icon={Percent} />
        <StatCard label="Reviews This Month" value={`+${stats.reviewsThisMonth}`} icon={CalendarDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReviewGrowthChart initialSeries={series} />
        </div>
        <RatingDistributionCard data={distribution} />
      </div>

      <RequestFunnelChart data={funnel} />
    </div>
  );
}
