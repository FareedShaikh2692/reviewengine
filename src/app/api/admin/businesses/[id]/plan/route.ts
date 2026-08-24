import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({ planKey: z.enum(["FREE", "GROWTH", "PRO", "ENTERPRISE"]) });

export async function POST(request: Request, ctx: RouteContext<"/api/admin/businesses/[id]/plan">) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const org = await db.organization.findUnique({ where: { id } });
  if (!org) return apiError(404, "Organization not found.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const plan = await db.plan.findUniqueOrThrow({ where: { key: parsed.data.planKey } });

  await db.subscription.upsert({
    where: { organizationId: id },
    create: { organizationId: id, planId: plan.id, status: "ACTIVE" },
    update: { planId: plan.id, status: "ACTIVE" },
  });

  await db.adminActivity.create({
    data: { adminUserId: auth.admin.id, action: "ORG_PLAN_CHANGED", targetType: "Organization", targetId: id, metadata: { planKey: parsed.data.planKey } },
  });
  await logAudit({
    organizationId: id,
    adminUserId: auth.admin.id,
    action: "ORG_PLAN_CHANGED",
    resourceType: "Subscription",
    resourceId: id,
    ipAddress: ipFromRequest(request),
    metadata: { planKey: parsed.data.planKey },
  });

  return Response.json({ ok: true });
}
