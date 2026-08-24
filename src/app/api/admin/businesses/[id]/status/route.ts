import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) });

export async function POST(request: Request, ctx: RouteContext<"/api/admin/businesses/[id]/status">) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const org = await db.organization.findUnique({ where: { id } });
  if (!org) return apiError(404, "Organization not found.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  await db.organization.update({ where: { id }, data: { status: parsed.data.status } });

  await db.adminActivity.create({
    data: { adminUserId: auth.admin.id, action: "ORG_STATUS_CHANGED", targetType: "Organization", targetId: id, metadata: { status: parsed.data.status } },
  });
  await logAudit({
    organizationId: id,
    adminUserId: auth.admin.id,
    action: "ORG_STATUS_CHANGED",
    resourceType: "Organization",
    resourceId: id,
    ipAddress: ipFromRequest(request),
    metadata: { status: parsed.data.status },
  });

  return Response.json({ ok: true });
}
