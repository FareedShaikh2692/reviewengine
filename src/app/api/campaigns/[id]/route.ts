import { db } from "@/lib/db";
import { requireOrgContext, requirePermission, apiError } from "@/lib/api";

export async function GET(request: Request, ctx: RouteContext<"/api/campaigns/[id]">) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      enrollments: { include: { customer: true }, orderBy: { enrolledAt: "desc" }, take: 50 },
    },
  });
  if (!campaign || campaign.organizationId !== auth.ctx.organizationId) return apiError(404, "Campaign not found.");

  const requestStats = await db.reviewRequest.groupBy({ by: ["status"], where: { campaignId: id }, _count: true });

  return Response.json({ campaign, requestStats });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/campaigns/[id]">) {
  const auth = await requirePermission("MANAGE_CAMPAIGNS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign || campaign.organizationId !== auth.ctx.organizationId) return apiError(404, "Campaign not found.");

  await db.campaign.delete({ where: { id } });
  return Response.json({ ok: true });
}
