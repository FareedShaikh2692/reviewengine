import { z } from "zod";
import { db } from "@/lib/db";
import { requireOrgContext, apiError, parseBody } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2).max(120),
  industry: z.string().min(2).max(80),
  description: z.string().max(1000).optional(),
  phone: z.string().max(40).optional(),
  website: z.string().max(200).optional(),
  logoUrl: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found for this organization.");

  await db.business.update({
    where: { id: business.id },
    data: {
      name: parsed.data.name,
      industry: parsed.data.industry,
      description: parsed.data.description,
      phone: parsed.data.phone,
      website: parsed.data.website,
      logoUrl: parsed.data.logoUrl,
    },
  });

  const primaryLocation = await db.businessLocation.findFirst({ where: { businessId: business.id, isPrimary: true } });
  if (primaryLocation && (parsed.data.address || parsed.data.city)) {
    await db.businessLocation.update({
      where: { id: primaryLocation.id },
      data: { address: parsed.data.address, city: parsed.data.city },
    });
  }

  return Response.json({ ok: true });
}
