import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1).max(120),
  address: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_LOCATIONS");
  if ("error" in auth) return auth.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const location = await db.businessLocation.create({
    data: { businessId: business.id, ...parsed.data },
  });

  return Response.json({ ok: true, location });
}
