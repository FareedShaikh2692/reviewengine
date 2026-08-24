import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { renderTemplate, DEFAULT_REQUEST_TEMPLATE } from "@/lib/message-template";
import { getQueue, QUEUE_NAMES } from "@/lib/queue";
import type { RequestChannel } from "@/generated/prisma/enums";

export async function createReviewRequest(params: {
  organizationId: string;
  businessId: string;
  customerId: string;
  channel: RequestChannel;
  campaignId?: string;
  template?: string;
  sendImmediately?: boolean;
}) {
  const [business, customer] = await Promise.all([
    db.business.findUniqueOrThrow({ where: { id: params.businessId } }),
    db.customer.findUniqueOrThrow({ where: { id: params.customerId } }),
  ]);

  const request = await db.reviewRequest.create({
    data: {
      organizationId: params.organizationId,
      businessId: params.businessId,
      locationId: customer.locationId ?? undefined,
      customerId: params.customerId,
      campaignId: params.campaignId,
      channel: params.channel,
      message: "",
    },
  });

  const reviewLink = `${env.APP_URL}/r/${request.trackingToken}`;
  const message = renderTemplate(params.template ?? DEFAULT_REQUEST_TEMPLATE, {
    customer_name: customer.firstName,
    business_name: business.name,
    review_link: reviewLink,
  });

  await db.reviewRequest.update({ where: { id: request.id }, data: { message } });

  if (params.sendImmediately !== false) {
    await getQueue(QUEUE_NAMES.sendReviewRequest).add("send", { reviewRequestId: request.id });
  }

  return request;
}
