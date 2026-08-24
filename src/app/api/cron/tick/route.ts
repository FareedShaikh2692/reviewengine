import { env } from "@/lib/env";
import { apiError } from "@/lib/api";
import { processCampaignTick } from "@/lib/jobs/campaign-tick";
import { processAutomationTick } from "@/lib/jobs/automation-tick";
import { processReviewSyncDispatch } from "@/lib/jobs/review-sync-dispatch";

export const maxDuration = 60;

/**
 * Vercel Cron target — advances campaigns/automations and fans out review syncs.
 * Configure in vercel.json and set CRON_SECRET in the project's env vars; Vercel
 * automatically sends it as `Authorization: Bearer <CRON_SECRET>` on cron requests.
 * Safe to hit manually or more often than scheduled — every step is idempotent.
 */
export async function GET(request: Request) {
  if (env.CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return apiError(401, "Unauthorized.");
    }
  }

  const results = await Promise.allSettled([processCampaignTick(), processAutomationTick(), processReviewSyncDispatch()]);

  const errors = results
    .map((r, i) => (r.status === "rejected" ? { step: ["campaignTick", "automationTick", "reviewSyncDispatch"][i], error: String(r.reason) } : null))
    .filter((e): e is { step: string; error: string } => e !== null);

  if (errors.length > 0) {
    console.error("[cron/tick] one or more steps failed", errors);
  }

  return Response.json({ ok: errors.length === 0, ranAt: new Date().toISOString(), errors });
}
