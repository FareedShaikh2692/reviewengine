import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  isPrimary: z.boolean().optional(),
});

async function assertOwned(id: string, organizationId: string) {
  const location = await db.businessLocation.findUnique({ where: { id }, include: { business: true } });
  if (!location || location.business.organizationId !== organizationId) return null;
  return location;
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/locations/[id]">) {
  const auth = await requirePermission("MANAGE_LOCATIONS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const location = await assertOwned(id, auth.ctx.organizationId);
  if (!location) return apiError(404, "Location not found.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.isPrimary) {
    await db.businessLocation.updateMany({ where: { businessId: location.businessId }, data: { isPrimary: false } });
  }

  await db.businessLocation.update({ where: { id }, data: parsed.data });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/locations/[id]">) {
  const auth = await requirePermission("MANAGE_LOCATIONS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const location = await assertOwned(id, auth.ctx.organizationId);
  if (!location) return apiError(404, "Location not found.");
  if (location.isPrimary) return apiError(400, "Cannot delete the primary location.");

  await db.businessLocation.delete({ where: { id } });
  return Response.json({ ok: true });
}
