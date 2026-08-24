import { z } from "zod";
import { db } from "@/lib/db";
import { requireOrgContext, requirePermission, apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

const stepSchema = z.object({
  dayOffset: z.number().int().min(0),
  type: z.enum(["SEND_REQUEST", "REMINDER", "WAIT"]),
  messageTemplate: z.string().min(1),
});

const createSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]).default("EMAIL"),
  audienceStatuses: z.array(z.string()).default(["NEW"]),
  steps: z.array(stepSchema).min(1),
  launch: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  const campaigns = await db.campaign.findMany({
    where: { organizationId: auth.ctx.organizationId },
    include: {
      steps: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ campaigns });
}

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_CAMPAIGNS");
  if ("error" in auth) return auth.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found for this organization.");

  const parsed = await parseBody(request, createSchema);
  if ("error" in parsed) return parsed.error;

  const campaign = await db.campaign.create({
    data: {
      organizationId: auth.ctx.organizationId,
      businessId: business.id,
      name: parsed.data.name,
      description: parsed.data.description,
      channel: parsed.data.channel,
      audience: { status: parsed.data.audienceStatuses },
      status: parsed.data.launch ? "RUNNING" : "DRAFT",
      steps: {
        create: parsed.data.steps.map((s, i) => ({
          order: i,
          dayOffset: s.dayOffset,
          type: s.type,
          messageTemplate: s.messageTemplate,
        })),
      },
    },
    include: { steps: true },
  });

  if (parsed.data.launch) {
    const customers = await db.customer.findMany({
      where: {
        organizationId: auth.ctx.organizationId,
        businessId: business.id,
        status: { in: parsed.data.audienceStatuses as never },
        consentStatus: "SUBSCRIBED",
      },
    });
    if (customers.length > 0) {
      await db.campaignEnrollment.createMany({
        data: customers.map((c) => ({ campaignId: campaign.id, customerId: c.id, nextRunAt: new Date() })),
        skipDuplicates: true,
      });
    }
  }

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "CAMPAIGN_CREATED",
    resourceType: "Campaign",
    resourceId: campaign.id,
    ipAddress: ipFromRequest(request),
  });

  return Response.json({ ok: true, campaign });
}
