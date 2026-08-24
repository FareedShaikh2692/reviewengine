import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/glass-card";

const SENTIMENT_VARIANT: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  POSITIVE: "success",
  NEUTRAL: "warning",
  NEGATIVE: "danger",
};

export type ReviewCardData = {
  id: string;
  reviewerName: string;
  rating: number;
  content: string | null;
  reviewDate: Date | string;
  sentiment?: string | null;
  topics?: string[];
  platformName?: string | null;
  locationName?: string | null;
};

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900">{review.reviewerName}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
            <span className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current" : "fill-none stroke-current opacity-30"}`} />
              ))}
            </span>
            <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
            {review.platformName && <Badge variant="outline">{review.platformName}</Badge>}
            {review.locationName && <span>· {review.locationName}</span>}
          </div>
        </div>
        {review.sentiment && <Badge variant={SENTIMENT_VARIANT[review.sentiment] ?? "neutral"}>{review.sentiment}</Badge>}
      </div>
      {review.content && <p className="mt-3 text-sm leading-relaxed text-ink-700">{review.content}</p>}
      {review.topics && review.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.topics.map((t) => (
            <Badge key={t} variant="neutral">{t}</Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
