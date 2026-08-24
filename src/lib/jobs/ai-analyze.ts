import { db } from "@/lib/db";
import { analyzeSentiment } from "@/lib/integrations/ai";

export async function processAiAnalyze(params: { organizationId: string; businessId: string }) {
  const reviews = await db.review.findMany({
    where: { organizationId: params.organizationId, businessId: params.businessId, sentiment: null },
    take: 100,
  });
  if (reviews.length === 0) return;

  const { results } = await analyzeSentiment(reviews.map((r) => ({ id: r.id, rating: r.rating, content: r.content })));

  await Promise.all(
    results.map((r) =>
      db.review.update({
        where: { id: r.reviewId },
        data: { sentiment: r.sentiment, sentimentScore: r.score, topics: r.topics },
      })
    )
  );
}
