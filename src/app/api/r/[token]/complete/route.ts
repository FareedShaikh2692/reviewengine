import { db } from "@/lib/db";
import { apiError } from "@/lib/api";
import { notifyOrg } from "@/lib/notify";

export async function POST(request: Request, ctx: RouteContext<"/api/r/[token]/complete">) {
  const { token } = await ctx.params;

  const reviewRequest = await db.reviewRequest.findUnique({ where: { trackingToken: token }, include: { customer: true } });
  if (!reviewRequest) return apiError(404, "Not found.");

  await db.reviewRequest.update({
    where: { id: reviewRequest.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  await db.customer.update({ where: { id: reviewRequest.customerId }, data: { status: "REVIEWED" } });

  await notifyOrg({
    organizationId: reviewRequest.organizationId,
    type: "REVIEW_REQUEST_COMPLETED",
    title: "Review request completed",
    body: `${reviewRequest.customer.firstName} ${reviewRequest.customer.lastName ?? ""} confirmed they left a review.`.trim(),
    metadata: { reviewRequestId: reviewRequest.id, customerId: reviewRequest.customerId },
  });

  return Response.json({ ok: true });
}
