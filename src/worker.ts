import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection, getQueue, QUEUE_NAMES, type SendReviewRequestJob, type AiAnalyzeJob, type ReviewSyncJob } from "@/lib/queue";
import { processSendReviewRequest } from "@/lib/jobs/send-review-request";
import { processCampaignTick } from "@/lib/jobs/campaign-tick";
import { processAutomationTick } from "@/lib/jobs/automation-tick";
import { processAiAnalyze } from "@/lib/jobs/ai-analyze";
import { processReviewSync } from "@/lib/jobs/review-sync";
import { processReviewSyncDispatch } from "@/lib/jobs/review-sync-dispatch";
import { processNotify } from "@/lib/jobs/notify";
import type { NotifyJob } from "@/lib/queue";

console.log("[worker] starting Review Engine background worker...");

new Worker(
  QUEUE_NAMES.sendReviewRequest,
  async (job) => processSendReviewRequest((job.data as SendReviewRequestJob).reviewRequestId),
  { connection: redisConnection }
);

new Worker(QUEUE_NAMES.campaignTick, async () => processCampaignTick(), { connection: redisConnection });
new Worker(QUEUE_NAMES.automationTick, async () => processAutomationTick(), { connection: redisConnection });
new Worker(QUEUE_NAMES.aiAnalyze, async (job) => processAiAnalyze(job.data as AiAnalyzeJob), { connection: redisConnection });
new Worker(QUEUE_NAMES.reviewSync, async (job) => processReviewSync(job.data as ReviewSyncJob), { connection: redisConnection });
new Worker(QUEUE_NAMES.reviewSyncDispatch, async () => processReviewSyncDispatch(), { connection: redisConnection });
new Worker(QUEUE_NAMES.notify, async (job) => processNotify(job.data as NotifyJob), { connection: redisConnection });

// Repeatable schedulers: campaigns and automations advance every minute; review sync fans out hourly.
async function scheduleRepeats() {
  await getQueue(QUEUE_NAMES.campaignTick).upsertJobScheduler("campaign-tick-repeat", { every: 60_000 }, { name: "tick" });
  await getQueue(QUEUE_NAMES.automationTick).upsertJobScheduler("automation-tick-repeat", { every: 60_000 }, { name: "tick" });
  await getQueue(QUEUE_NAMES.reviewSyncDispatch).upsertJobScheduler("review-sync-dispatch-repeat", { every: 60 * 60_000 }, { name: "dispatch" });
}

scheduleRepeats()
  .then(() => console.log("[worker] repeatable jobs scheduled (campaign-tick, automation-tick every 60s)"))
  .catch((err) => console.error("[worker] failed to schedule repeatable jobs", err));

console.log("[worker] listening on queues:", Object.values(QUEUE_NAMES).join(", "));
