import type { Business, ReviewPlatform } from "@/generated/prisma/client";

export function buildPlatformReviewUrl(platform: ReviewPlatform, business: Business): string {
  if (platform.key === "GOOGLE" && business.googlePlaceId && platform.reviewUrlTemplate) {
    return platform.reviewUrlTemplate.replace("{{placeId}}", business.googlePlaceId);
  }
  // We don't have a stored per-platform business ID for the others yet — send the customer
  // to a search for the business on that platform rather than a fabricated/broken deep link.
  return `https://www.google.com/search?q=${encodeURIComponent(`${business.name} reviews site:${platform.key.toLowerCase()}.com`)}`;
}
