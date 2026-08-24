import { db } from "@/lib/db";
import { requireOrgContext, apiError } from "@/lib/api";
import { processReviewSync } from "@/lib/jobs/review-sync";

export async function POST() {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found.");

  const result = await processReviewSync({ organizationId: auth.ctx.organizationId, businessId: business.id });
  return Response.json({ ok: true, ...result });
}
