import { db } from "@/lib/db";
import { requireOrgContext, apiError } from "@/lib/api";

export async function PATCH(request: Request, ctx: RouteContext<"/api/notifications/[id]">) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const notification = await db.notification.findUnique({ where: { id } });
  if (!notification || notification.organizationId !== auth.ctx.organizationId) return apiError(404, "Not found.");

  await db.notification.update({ where: { id }, data: { isRead: true } });
  return Response.json({ ok: true });
}
