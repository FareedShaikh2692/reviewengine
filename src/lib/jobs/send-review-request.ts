import { db } from "@/lib/db";
import { dispatchMessage } from "@/lib/messaging";

export async function processSendReviewRequest(reviewRequestId: string) {
  const request = await db.reviewRequest.findUnique({
    where: { id: reviewRequestId },
    include: { customer: true },
  });
  if (!request) return;

  if (request.customer.consentStatus !== "SUBSCRIBED") {
    await db.reviewRequest.update({ where: { id: request.id }, data: { status: "UNSUBSCRIBED" } });
    return;
  }

  const to =
    request.channel === "EMAIL" ? request.customer.email : request.customer.phone;

  if (!to) {
    await db.reviewRequest.update({ where: { id: request.id }, data: { status: "FAILED", failedAt: new Date() } });
    return;
  }

  await dispatchMessage({
    organizationId: request.organizationId,
    reviewRequestId: request.id,
    channel: request.channel,
    to,
    subject: `A quick favor from ${request.customer.company ?? ""}`.trim(),
    body: request.message,
  });

  await db.customer.update({
    where: { id: request.customerId },
    data: {
      status: request.customer.status === "NEW" ? "REVIEW_REQUESTED" : request.customer.status,
      lastReviewRequestAt: new Date(),
    },
  });
}
