import { db } from "@/lib/db";
import type { NotifyJob } from "@/lib/queue";
import type { Prisma } from "@/generated/prisma/client";

export async function processNotify(job: NotifyJob) {
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
