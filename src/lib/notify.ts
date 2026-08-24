import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type NotifyJob = {
  organizationId: string;
  userId?: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
};

/** Creates an in-app notification. Direct DB write — fast enough to call inline, no queue needed. */
export async function notifyOrg(job: NotifyJob) {
  await db.notification.create({
    data: {
      organizationId: job.organizationId,
      userId: job.userId,
      type: job.type,
      title: job.title,
      body: job.body,
      metadata: job.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
