import { db } from "@/lib/db";
import { apiError } from "@/lib/api";
import { notifyOrg } from "@/lib/notify";

export async function POST(request: Request, ctx: RouteContext<"/api/r/[token]/unsubscribe">) {
  const { token } = await ctx.params;

  const reviewRequest = await db.reviewRequest.findUnique({ where: { trackingToken: token }, include: { customer: true } });
  if (!reviewRequest) return apiError(404, "Not found.");

  await db.customer.update({ where: { id: reviewRequest.customerId }, data: { consentStatus: "UNSUBSCRIBED" } });
  await db.reviewRequest.update({ where: { id: reviewRequest.id }, data: { status: "UNSUBSCRIBED" } });

  await notifyOrg({
    organizationId: reviewRequest.organizationId,
    type: "CUSTOMER_UNSUBSCRIBED",
    title: "Customer unsubscribed",
    body: `${reviewRequest.customer.firstName} ${reviewRequest.customer.lastName ?? ""} opted out of future review requests.`.trim(),
    metadata: { customerId: reviewRequest.customerId },
  });

  return Response.json({ ok: true });
}
