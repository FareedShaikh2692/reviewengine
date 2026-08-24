import { z } from "zod";
import { db } from "@/lib/db";
import { requireOrgContext, requirePermission, apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";
import { createReviewRequest } from "@/lib/review-requests";

const createSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  company: z.string().max(120).optional(),
  serviceProduct: z.string().max(160).optional(),
  purchaseDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  sendReviewRequest: z.boolean().optional(),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]).optional(),
});

export async function GET(request: Request) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status");
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = 20;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return Response.json({ customers: [], total: 0 });

  const where = {
    organizationId: auth.ctx.organizationId,
    businessId: business.id,
    ...(status ? { status: status as never } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.customer.count({ where }),
  ]);

  return Response.json({ customers, total, pageSize });
}

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_CUSTOMERS");
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, createSchema);
  if ("error" in parsed) return parsed.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found for this organization.");

  const primaryLocation = await db.businessLocation.findFirst({ where: { businessId: business.id, isPrimary: true } });

  const customer = await db.customer.create({
    data: {
      organizationId: auth.ctx.organizationId,
      businessId: business.id,
      locationId: primaryLocation?.id,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || undefined,
      phone: parsed.data.phone,
      company: parsed.data.company,
      serviceProduct: parsed.data.serviceProduct,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : undefined,
      notes: parsed.data.notes,
      source: "MANUAL",
    },
  });

  if (parsed.data.tags?.length) {
    for (const tagName of parsed.data.tags) {
      const tag = await db.customerTag.upsert({
        where: { organizationId_name: { organizationId: auth.ctx.organizationId, name: tagName } },
        create: { organizationId: auth.ctx.organizationId, name: tagName },
        update: {},
      });
      await db.customerTagAssignment.create({ data: { customerId: customer.id, tagId: tag.id } });
    }
  }

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "CUSTOMER_CREATED",
    resourceType: "Customer",
    resourceId: customer.id,
    ipAddress: ipFromRequest(request),
  });

  if (parsed.data.sendReviewRequest) {
    await createReviewRequest({
      organizationId: auth.ctx.organizationId,
      businessId: business.id,
      customerId: customer.id,
      channel: parsed.data.channel ?? "EMAIL",
    });
  }

  return Response.json({ ok: true, customer });
}
