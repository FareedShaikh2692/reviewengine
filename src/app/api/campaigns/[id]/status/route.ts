import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({ status: z.enum(["DRAFT", "SCHEDULED", "RUNNING", "PAUSED", "COMPLETED"]) });

export async function POST(request: Request, ctx: RouteContext<"/api/campaigns/[id]/status">) {
  const auth = await requirePermission("MANAGE_CAMPAIGNS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign || campaign.organizationId !== auth.ctx.organizationId) return apiError(404, "Campaign not found.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  await db.campaign.update({ where: { id }, data: { status: parsed.data.status } });

  if (parsed.data.status === "RUNNING") {
    const audience = campaign.audience as { status?: string[] };
    const customers = await db.customer.findMany({
      where: {
        organizationId: auth.ctx.organizationId,
        businessId: campaign.businessId,
        status: { in: (audience.status ?? ["NEW"]) as never },
        consentStatus: "SUBSCRIBED",
      },
    });
    if (customers.length > 0) {
      await db.campaignEnrollment.createMany({
        data: customers.map((c) => ({ campaignId: id, customerId: c.id, nextRunAt: new Date() })),
        skipDuplicates: true,
      });
    }
  }

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "CAMPAIGN_STATUS_CHANGED",
    resourceType: "Campaign",
    resourceId: id,
    ipAddress: ipFromRequest(request),
    metadata: { status: parsed.data.status },
  });

  return Response.json({ ok: true });
}
