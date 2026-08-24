import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { apiError } from "@/lib/api";
import { ACTIVE_ORG_COOKIE } from "@/lib/tenant";
import { logAudit, ipFromRequest } from "@/lib/audit";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/businesses/[id]/impersonate">) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const org = await db.organization.findUnique({ where: { id } });
  if (!org) return apiError(404, "Organization not found.");

  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: id, userId: auth.admin.userId } },
    create: { organizationId: id, userId: auth.admin.userId, role: "VIEWER", status: "ACTIVE" },
    update: {},
  });

  await db.adminActivity.create({
    data: { adminUserId: auth.admin.id, action: "IMPERSONATE_STARTED", targetType: "Organization", targetId: id },
  });
  await logAudit({
    organizationId: id,
    adminUserId: auth.admin.id,
    action: "IMPERSONATE_STARTED",
    resourceType: "Organization",
    resourceId: id,
    ipAddress: ipFromRequest(request),
  });

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ACTIVE_ORG_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 4}`
  );
  return response;
}
