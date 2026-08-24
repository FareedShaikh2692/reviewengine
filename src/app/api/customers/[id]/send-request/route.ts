import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";
import { createReviewRequest } from "@/lib/review-requests";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({ channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]).default("EMAIL") });

export async function POST(request: Request, ctx: RouteContext<"/api/customers/[id]/send-request">) {
  const auth = await requirePermission("SEND_REQUESTS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer || customer.organizationId !== auth.ctx.organizationId) return apiError(404, "Customer not found.");
  if (customer.consentStatus !== "SUBSCRIBED") return apiError(400, "This customer has opted out of communications.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const requestRow = await createReviewRequest({
    organizationId: auth.ctx.organizationId,
    businessId: customer.businessId,
    customerId: customer.id,
    channel: parsed.data.channel,
  });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "REVIEW_REQUEST_SENT",
    resourceType: "ReviewRequest",
    resourceId: requestRow.id,
    ipAddress: ipFromRequest(request),
  });

  return Response.json({ ok: true, reviewRequestId: requestRow.id });
}
