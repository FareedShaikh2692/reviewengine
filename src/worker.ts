import "dotenv/config";
import { processCampaignTick } from "@/lib/jobs/campaign-tick";
import { processAutomationTick } from "@/lib/jobs/automation-tick";
import { processReviewSyncDispatch } from "@/lib/jobs/review-sync-dispatch";

/**
 * Optional self-hosted alternative to Vercel Cron (see /api/cron/tick and vercel.json).
 * Only run this if you're deploying somewhere that supports a long-lived process
 * (a VM, Docker, Railway, Render, etc.) instead of Vercel's serverless functions.
 */
console.log("[worker] starting Review Engine background worker (self-hosted interval mode)...");

async function tick() {
  try {
    await processCampaignTick();
  } catch (err) {
    console.error("[worker] campaign tick failed", err);
  }
  try {
    await processAutomationTick();
  } catch (err) {
    console.error("[worker] automation tick failed", err);
  }
}

async function reviewSyncTick() {
  try {
    await processReviewSyncDispatch();
  } catch (err) {
    console.error("[worker] review sync dispatch failed", err);
  }
}

void tick();
void reviewSyncTick();
setInterval(tick, 60_000);
setInterval(reviewSyncTick, 60 * 60_000);

console.log("[worker] running — campaign/automation ticks every 60s, review sync dispatch every hour");
