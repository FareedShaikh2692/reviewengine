import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  priceMonthly: z.number().int().min(0).optional(),
  priceYearly: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  stripePriceId: z.string().max(200).nullable().optional(),
  limits: z
    .object({
      businesses: z.number().int(),
      customers: z.number().int(),
      reviewRequests: z.number().int(),
      locations: z.number().int(),
      teamMembers: z.number().int(),
    })
    .optional(),
  features: z.array(z.string()).optional(),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/plans/[id]">) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const plan = await db.plan.findUnique({ where: { id } });
  if (!plan) return apiError(404, "Plan not found.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const updated = await db.plan.update({ where: { id }, data: parsed.data });

  await db.adminActivity.create({
    data: { adminUserId: auth.admin.id, action: "PLAN_UPDATED", targetType: "Plan", targetId: id, metadata: parsed.data },
  });
  await logAudit({
    adminUserId: auth.admin.id,
    action: "PLAN_UPDATED",
    resourceType: "Plan",
    resourceId: id,
    ipAddress: ipFromRequest(request),
    metadata: parsed.data,
  });

  return Response.json({ ok: true, plan: updated });
}
