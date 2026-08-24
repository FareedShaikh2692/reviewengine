import { db } from "@/lib/db";

export async function getOverviewStats(organizationId: string) {
  const [reviewAgg, requestCounts, thisMonthReviews, lastSnapshot, prevSnapshot] = await Promise.all([
    db.review.aggregate({ where: { organizationId }, _count: true, _avg: { rating: true } }),
    db.reviewRequest.groupBy({ by: ["status"], where: { organizationId }, _count: true }),
    db.review.count({
      where: { organizationId, reviewDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    db.analyticsSnapshot.findFirst({ where: { organizationId }, orderBy: { date: "desc" } }),
    db.analyticsSnapshot.findFirst({ where: { organizationId }, orderBy: { date: "desc" }, skip: 6 }),
  ]);

  const totalRequests = requestCounts.reduce((sum, r) => sum + r._count, 0);
  const completed = requestCounts.find((r) => r.status === "COMPLETED")?._count ?? 0;
  const conversionRate = totalRequests > 0 ? (completed / totalRequests) * 100 : 0;

  const ratingDelta =
    lastSnapshot && prevSnapshot && prevSnapshot.averageRating > 0
      ? ((lastSnapshot.averageRating - prevSnapshot.averageRating) / prevSnapshot.averageRating) * 100
      : 0;

  return {
    totalReviews: reviewAgg._count,
    averageRating: reviewAgg._avg.rating ?? 0,
    totalRequests,
    completedRequests: completed,
    conversionRate,
    reviewsThisMonth: thisMonthReviews,
    ratingDeltaPct: Number(ratingDelta.toFixed(1)),
  };
}

export async function getReviewGrowthSeries(organizationId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const snapshots = await db.analyticsSnapshot.findMany({
    where: { organizationId, date: { gte: since } },
    orderBy: { date: "asc" },
  });
  return snapshots.map((s) => ({
    date: s.date.toISOString().slice(5, 10),
    totalReviews: s.totalReviews,
    averageRating: s.averageRating,
  }));
}

export async function getRequestFunnel(organizationId: string) {
  const counts = await db.reviewRequest.groupBy({ by: ["status"], where: { organizationId }, _count: true });
  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const sent = (byStatus.SENT ?? 0) + (byStatus.DELIVERED ?? 0) + (byStatus.OPENED ?? 0) + (byStatus.CLICKED ?? 0) + (byStatus.COMPLETED ?? 0);
  return [
    { stage: "Sent", value: sent },
    { stage: "Delivered", value: (byStatus.DELIVERED ?? 0) + (byStatus.OPENED ?? 0) + (byStatus.CLICKED ?? 0) + (byStatus.COMPLETED ?? 0) },
    { stage: "Opened", value: (byStatus.OPENED ?? 0) + (byStatus.CLICKED ?? 0) + (byStatus.COMPLETED ?? 0) },
    { stage: "Clicked", value: (byStatus.CLICKED ?? 0) + (byStatus.COMPLETED ?? 0) },
    { stage: "Completed", value: byStatus.COMPLETED ?? 0 },
  ];
}

export async function getRatingDistribution(organizationId: string) {
  const reviews = await db.review.groupBy({ by: ["rating"], where: { organizationId }, _count: true });
  const total = reviews.reduce((sum, r) => sum + r._count, 0) || 1;
  const byRating = Object.fromEntries(reviews.map((r) => [r.rating, r._count]));
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: byRating[stars] ?? 0,
    pct: Math.round(((byRating[stars] ?? 0) / total) * 100),
  }));
}
