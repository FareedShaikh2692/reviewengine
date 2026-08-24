import { Star } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/states";
import { RatingFilter } from "@/components/dashboard/reviews/rating-filter";
import { SyncReviewsButton } from "@/components/dashboard/reviews/sync-button";
import { ReviewCard } from "@/components/review/review-card";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; platform?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) return null;
  const { rating, platform } = await searchParams;

  const [reviews, platforms] = await Promise.all([
    db.review.findMany({
      where: {
        organizationId: ctx.organizationId,
        ...(rating ? { rating: Number(rating) } : {}),
        ...(platform ? { platformId: platform } : {}),
      },
      include: { platform: true, location: true },
      orderBy: { reviewDate: "desc" },
      take: 100,
    }),
    db.reviewPlatform.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Reviews</h1>
          <p className="mt-1 text-sm text-ink-500">All reviews synced from your connected platforms.</p>
        </div>
        <SyncReviewsButton />
      </div>

      <RatingFilter currentRating={rating} currentPlatform={platform} platforms={platforms.map((p) => ({ id: p.id, name: p.name }))} />

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews found" description="Connect a review platform or adjust your filters." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={{
                id: r.id,
                reviewerName: r.reviewerName,
                rating: r.rating,
                content: r.content,
                reviewDate: r.reviewDate,
                sentiment: r.sentiment,
                topics: r.topics,
                platformName: r.platform?.name,
                locationName: r.location?.name,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
