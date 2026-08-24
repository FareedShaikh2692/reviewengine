import { db } from "@/lib/db";
import { requireOrgContext } from "@/lib/api";

export async function POST() {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  await db.notification.updateMany({ where: { organizationId: auth.ctx.organizationId, isRead: false }, data: { isRead: true } });
  return Response.json({ ok: true });
}
