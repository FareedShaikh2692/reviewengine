import { db } from "@/lib/db";
import { requirePermission, apiError } from "@/lib/api";
import { processAiAnalyze } from "@/lib/jobs/ai-analyze";

export async function POST() {
  const auth = await requirePermission("RUN_AI_ANALYSIS");
  if ("error" in auth) return auth.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found.");

  await processAiAnalyze({ organizationId: auth.ctx.organizationId, businessId: business.id });
  return Response.json({ ok: true });
}
