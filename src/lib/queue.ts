import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";

const globalForQueue = globalThis as unknown as { redisConnection?: IORedis };

export const redisConnection =
  globalForQueue.redisConnection ??
  new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

if (process.env.NODE_ENV !== "production") {
  globalForQueue.redisConnection = redisConnection;
}

export const QUEUE_NAMES = {
  sendReviewRequest: "send-review-request",
  campaignTick: "campaign-tick",
  automationTick: "automation-tick",
  aiAnalyze: "ai-analyze",
  reviewSync: "review-sync",
  reviewSyncDispatch: "review-sync-dispatch",
  notify: "notify",
} as const;

type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<QueueName, Queue>();

export function getQueue(name: QueueName): Queue {
  let queue = queues.get(name);
  if (!queue) {
    queue = new Queue(name, { connection: redisConnection });
    queues.set(name, queue);
  }
  return queue;
}

export type SendReviewRequestJob = { reviewRequestId: string };
export type CampaignTickJob = Record<string, never>;
export type AutomationTickJob = Record<string, never>;
export type AiAnalyzeJob = { organizationId: string; businessId: string };
export type ReviewSyncJob = { organizationId: string; businessId: string };
export type NotifyJob = { organizationId: string; userId?: string; type: string; title: string; body: string; metadata?: Record<string, unknown> };
