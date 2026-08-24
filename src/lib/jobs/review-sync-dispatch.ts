import { db } from "@/lib/db";
import { getQueue, QUEUE_NAMES, type ReviewSyncJob } from "@/lib/queue";

/** Fans out a review-sync job for every business with a connected Google integration. */
export async function processReviewSyncDispatch() {
  const integrations = await db.businessIntegration.findMany({
    where: { provider: "GOOGLE", status: "CONNECTED" },
    select: { organizationId: true, businessId: true },
  });

  for (const integration of integrations) {
    const job: ReviewSyncJob = { organizationId: integration.organizationId, businessId: integration.businessId };
    await getQueue(QUEUE_NAMES.reviewSync).add("sync", job);
  }
}
