import { db } from "@/lib/db";

export type BusinessInsight = { tone: "positive" | "neutral" | "warning"; text: string };

/** Generates insight sentences strictly from real stored data — never fabricated. */
export async function generateBusinessInsights(organizationId: string): Promise<BusinessInsight[]> {
  const insights: BusinessInsight[] = [];

  const snapshots = await db.analyticsSnapshot.findMany({
    where: { organizationId },
    orderBy: { date: "asc" },
  });

  if (snapshots.length >= 2) {
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    if (last.averageRating !== first.averageRating) {
      const direction = last.averageRating > first.averageRating ? "increased" : "decreased";
      insights.push({
        tone: last.averageRating > first.averageRating ? "positive" : "warning",
        text: `Your rating ${direction} from ${first.averageRating.toFixed(1)} to ${last.averageRating.toFixed(1)} over the last ${snapshots.length} days.`,
      });
    }
  }

  const reviews = await db.review.findMany({ where: { organizationId }, select: { topics: true, sentiment: true } });
  const topicCounts = new Map<string, { positive: number; negative: number }>();
  for (const r of reviews) {
    for (const topic of r.topics) {
      const entry = topicCounts.get(topic) ?? { positive: 0, negative: 0 };
      if (r.sentiment === "POSITIVE") entry.positive += 1;
      if (r.sentiment === "NEGATIVE") entry.negative += 1;
      topicCounts.set(topic, entry);
    }
  }

  const topPositive = [...topicCounts.entries()].sort((a, b) => b[1].positive - a[1].positive)[0];
  if (topPositive && topPositive[1].positive >= 2) {
    insights.push({ tone: "positive", text: `Customer feedback frequently mentions your ${topPositive[0].toLowerCase()} positively.` });
  }

  const topNegative = [...topicCounts.entries()].sort((a, b) => b[1].negative - a[1].negative)[0];
  if (topNegative && topNegative[1].negative >= 2) {
    insights.push({ tone: "warning", text: `Several reviews mention concerns about ${topNegative[0].toLowerCase()}.` });
  }

  const requestCounts = await db.reviewRequest.groupBy({ by: ["status"], where: { organizationId }, _count: true });
  const totalRequests = requestCounts.reduce((sum, r) => sum + r._count, 0);
  const completed = requestCounts.find((r) => r.status === "COMPLETED")?._count ?? 0;
  if (totalRequests > 0) {
    const rate = (completed / totalRequests) * 100;
    insights.push({
      tone: rate >= 50 ? "positive" : "neutral",
      text: `${rate.toFixed(0)}% of your review requests have resulted in a completed review.`,
    });
  }

  return insights;
}
