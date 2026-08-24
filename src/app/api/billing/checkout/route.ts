import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";
import { startCheckout } from "@/lib/integrations/billing";
import { env } from "@/lib/env";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({ planKey: z.enum(["FREE", "GROWTH", "PRO", "ENTERPRISE"]) });

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_BILLING");
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const plan = await db.plan.findUnique({ where: { key: parsed.data.planKey } });
  if (!plan) return apiError(404, "Plan not found.");

  const { url } = await startCheckout({
    organizationId: auth.ctx.organizationId,
    planId: plan.id,
    planKey: plan.key,
    successUrl: `${env.APP_URL}/dashboard/settings/billing`,
    cancelUrl: `${env.APP_URL}/dashboard/settings/billing`,
  });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "BILLING_PLAN_CHANGE_INITIATED",
    resourceType: "Subscription",
    ipAddress: ipFromRequest(request),
    metadata: { planKey: parsed.data.planKey },
  });

  return Response.json({ ok: true, url });
}
