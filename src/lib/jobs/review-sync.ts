import { db } from "@/lib/db";
import { fetchPlaceReviews } from "@/lib/integrations/google-places";
import { notifyOrg } from "@/lib/notify";

export async function processReviewSync(params: { organizationId: string; businessId: string }) {
  const business = await db.business.findUnique({ where: { id: params.businessId } });
  if (!business?.googlePlaceId) return { inserted: 0 };

  const platform = await db.reviewPlatform.findUnique({ where: { key: "GOOGLE" } });
  const fetched = await fetchPlaceReviews(business.googlePlaceId);
  if (fetched.length === 0) return { inserted: 0 };

  const existing = await db.review.findMany({
    where: { businessId: business.id, externalId: { in: fetched.map((r) => r.externalId) } },
    select: { externalId: true },
  });
  const existingIds = new Set(existing.map((r) => r.externalId));
  const newReviews = fetched.filter((r) => !existingIds.has(r.externalId));
  if (newReviews.length === 0) return { inserted: 0 };

  const previousAvg = await db.review.aggregate({ where: { businessId: business.id }, _avg: { rating: true } });

  await db.review.createMany({
    data: newReviews.map((r) => ({
      organizationId: params.organizationId,
      businessId: business.id,
      platformId: platform?.id,
      reviewerName: r.reviewerName,
      rating: r.rating,
      content: r.content,
      reviewDate: r.reviewDate,
      externalId: r.externalId,
      isMock: r.isMock,
    })),
  });

  await notifyOrg({
    organizationId: params.organizationId,
    type: "NEW_REVIEW",
    title: newReviews.length === 1 ? "New review detected" : `${newReviews.length} new reviews detected`,
    body:
      newReviews.length === 1
        ? `${newReviews[0].reviewerName} left a ${newReviews[0].rating}-star review.`
        : `${newReviews.length} new reviews came in from Google.`,
    metadata: { businessId: business.id, count: newReviews.length },
  });

  const newAvg = await db.review.aggregate({ where: { businessId: business.id }, _avg: { rating: true } });
  const before = previousAvg._avg.rating ?? 0;
  const after = newAvg._avg.rating ?? 0;
  if (before > 0 && Math.abs(after - before) >= 0.1) {
    await notifyOrg({
      organizationId: params.organizationId,
      type: "RATING_CHANGE",
      title: after > before ? "Rating increased" : "Rating decreased",
      body: `Your average rating ${after > before ? "rose" : "fell"} from ${before.toFixed(1)} to ${after.toFixed(1)}.`,
      metadata: { businessId: business.id, before, after },
    });
  }

  return { inserted: newReviews.length };
}
