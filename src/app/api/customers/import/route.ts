import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const rowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  serviceProduct: z.string().optional(),
  purchaseDate: z.string().optional(),
});

const schema = z.object({ rows: z.array(rowSchema).max(2000) });

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_CUSTOMERS");
  if ("error" in auth) return auth.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found for this organization.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const existingEmails = new Set(
    (
      await db.customer.findMany({
        where: { organizationId: auth.ctx.organizationId, email: { not: null } },
        select: { email: true },
      })
    ).map((c) => c.email)
  );

  let imported = 0;
  let skippedDuplicate = 0;
  const seenInBatch = new Set<string>();

  for (const row of parsed.data.rows) {
    const email = row.email?.trim().toLowerCase() || undefined;
    if (email && (existingEmails.has(email) || seenInBatch.has(email))) {
      skippedDuplicate += 1;
      continue;
    }
    if (email) seenInBatch.add(email);

    await db.customer.create({
      data: {
        organizationId: auth.ctx.organizationId,
        businessId: business.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email,
        phone: row.phone,
        serviceProduct: row.serviceProduct,
        purchaseDate: row.purchaseDate ? new Date(row.purchaseDate) : undefined,
        source: "CSV",
      },
    });
    imported += 1;
  }

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "CUSTOMERS_IMPORTED",
    resourceType: "Customer",
    ipAddress: ipFromRequest(request),
    metadata: { imported, skippedDuplicate },
  });

  return Response.json({ ok: true, imported, skippedDuplicate });
}
