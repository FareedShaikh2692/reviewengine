import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({ role: z.enum(["OWNER", "ADMIN", "MANAGER", "STAFF", "VIEWER"]) });

export async function PATCH(request: Request, ctx: RouteContext<"/api/team/[id]">) {
  const auth = await requirePermission("MANAGE_TEAM");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const member = await db.organizationMember.findUnique({ where: { id } });
  if (!member || member.organizationId !== auth.ctx.organizationId) return apiError(404, "Member not found.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  await db.organizationMember.update({ where: { id }, data: { role: parsed.data.role } });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/team/[id]">) {
  const auth = await requirePermission("MANAGE_TEAM");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const member = await db.organizationMember.findUnique({ where: { id } });
  if (!member || member.organizationId !== auth.ctx.organizationId) return apiError(404, "Member not found.");
  if (member.role === "OWNER") return apiError(400, "Cannot remove the organization owner.");

  await db.organizationMember.delete({ where: { id } });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "TEAM_MEMBER_REMOVED",
    resourceType: "OrganizationMember",
    resourceId: id,
    ipAddress: ipFromRequest(request),
  });

  return Response.json({ ok: true });
}
