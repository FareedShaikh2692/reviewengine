import { notFound } from "next/navigation";
import { Sparkles, Star, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { buildPlatformReviewUrl } from "@/lib/review-platform-links";
import { ReviewCompletedButton, UnsubscribeLink } from "@/components/review-link/platform-actions";

const CLICK_ELIGIBLE_STATUSES = ["PENDING", "SENT", "DELIVERED", "OPENED"];

export default async function ReviewLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const reviewRequest = await db.reviewRequest.findUnique({
    where: { trackingToken: token },
    include: { business: true, customer: true },
  });
  if (!reviewRequest) notFound();

  if (CLICK_ELIGIBLE_STATUSES.includes(reviewRequest.status)) {
    await db.reviewRequest.update({ where: { id: reviewRequest.id }, data: { status: "CLICKED", clickedAt: new Date() } });
    if (reviewRequest.customer.status === "NEW" || reviewRequest.customer.status === "CONTACTED" || reviewRequest.customer.status === "REVIEW_REQUESTED") {
      await db.customer.update({ where: { id: reviewRequest.customerId }, data: { status: "CLICKED" } });
    }
  }

  const platforms = await db.reviewPlatform.findMany({ where: { isActive: true } });

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>

        <p className="text-sm text-ink-500">
          Hi {reviewRequest.customer.firstName}, thank you for choosing
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">{reviewRequest.business.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          We&apos;d love to hear about your experience. Choose where you&apos;d like to leave your review below —
          it only takes a minute.
        </p>

        <div className="mt-8 space-y-3">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={buildPlatformReviewUrl(platform, reviewRequest.business)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-border bg-background px-5 py-4 text-left shadow-premium transition hover:-translate-y-0.5 hover:border-brand-mid"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient/10">
                  <Star className="h-4 w-4" style={{ color: "var(--brand-mid)" }} />
                </span>
                <span className="text-sm font-medium text-ink-900">Review us on {platform.name}</span>
              </span>
              <ExternalLink className="h-4 w-4 text-ink-400" />
            </a>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <ReviewCompletedButton token={token} />
        </div>

        <div className="mt-6">
          <UnsubscribeLink token={token} />
        </div>
      </div>
    </div>
  );
}
