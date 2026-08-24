import { db } from "@/lib/db";
import { processReviewSync } from "@/lib/jobs/review-sync";

/** Runs a review sync for every business with a connected Google integration. */
export async function processReviewSyncDispatch() {
  const integrations = await db.businessIntegration.findMany({
    where: { provider: "GOOGLE", status: "CONNECTED" },
    select: { organizationId: true, businessId: true },
  });

  for (const integration of integrations) {
    try {
      await processReviewSync({ organizationId: integration.organizationId, businessId: integration.businessId });
    } catch (err) {
      console.error(`[review-sync-dispatch] failed for business ${integration.businessId}`, err);
    }
  }
}
