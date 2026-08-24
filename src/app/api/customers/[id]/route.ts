import { z } from "zod";
import { db } from "@/lib/db";
import { requireOrgContext, requirePermission, apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const updateSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().max(80).optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  company: z.string().max(120).optional(),
  serviceProduct: z.string().max(160).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(["NEW", "CONTACTED", "REVIEW_REQUESTED", "CLICKED", "REVIEWED", "UNSUBSCRIBED"]).optional(),
  consentStatus: z.enum(["SUBSCRIBED", "UNSUBSCRIBED", "DO_NOT_CONTACT"]).optional(),
});

async function loadCustomer(id: string, organizationId: string) {
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer || customer.organizationId !== organizationId) return null;
  return customer;
}

export async function GET(request: Request, ctx: RouteContext<"/api/customers/[id]">) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } }, reviewRequests: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!customer || customer.organizationId !== auth.ctx.organizationId) return apiError(404, "Customer not found.");

  return Response.json({ customer });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/customers/[id]">) {
  const auth = await requirePermission("MANAGE_CUSTOMERS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const existing = await loadCustomer(id, auth.ctx.organizationId);
  if (!existing) return apiError(404, "Customer not found.");

  const parsed = await parseBody(request, updateSchema);
  if ("error" in parsed) return parsed.error;

  const customer = await db.customer.update({
    where: { id },
    data: { ...parsed.data, email: parsed.data.email || undefined },
  });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "CUSTOMER_UPDATED",
    resourceType: "Customer",
    resourceId: id,
    ipAddress: ipFromRequest(request),
  });

  return Response.json({ ok: true, customer });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/customers/[id]">) {
  const auth = await requirePermission("MANAGE_CUSTOMERS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const existing = await loadCustomer(id, auth.ctx.organizationId);
  if (!existing) return apiError(404, "Customer not found.");

  await db.customer.delete({ where: { id } });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "CUSTOMER_DELETED",
    resourceType: "Customer",
    resourceId: id,
    ipAddress: ipFromRequest(request),
  });

  return Response.json({ ok: true });
}
