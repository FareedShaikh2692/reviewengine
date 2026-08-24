import { getQueue, QUEUE_NAMES, type NotifyJob } from "@/lib/queue";

/** Enqueues an in-app (and future email) notification for an organization. Safe to call from API routes or workers. */
export async function notifyOrg(job: NotifyJob) {
  await getQueue(QUEUE_NAMES.notify).add("notify", job);
}
