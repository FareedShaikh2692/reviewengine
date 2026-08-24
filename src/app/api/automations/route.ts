import { z } from "zod";
import { db } from "@/lib/db";
import { requireOrgContext, requirePermission, apiError, parseBody } from "@/lib/api";
import { DEFAULT_REQUEST_TEMPLATE, DEFAULT_REMINDER_TEMPLATE } from "@/lib/message-template";

const schema = z.object({ name: z.string().min(2).max(120) });

export async function GET() {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  const automations = await db.automation.findMany({
    where: { organizationId: auth.ctx.organizationId },
    include: { _count: { select: { executions: true, nodes: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ automations });
}

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_AUTOMATIONS");
  if ("error" in auth) return auth.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found for this organization.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const nodeDefs = [
    { type: "TRIGGER" as const, label: "Customer Added", x: 250, y: 0, config: {} },
    { type: "WAIT" as const, label: "Wait 1 Day", x: 250, y: 130, config: { days: 1 } },
    { type: "SEND_REQUEST" as const, label: "Send Review Request", x: 250, y: 260, config: { channel: "EMAIL", template: DEFAULT_REQUEST_TEMPLATE } },
    { type: "WAIT" as const, label: "Wait 3 Days", x: 250, y: 390, config: { days: 3 } },
    { type: "CONDITION" as const, label: "Review Completed?", x: 250, y: 520, config: {} },
    { type: "STOP" as const, label: "Stop", x: 80, y: 660, config: {} },
    { type: "SEND_REMINDER" as const, label: "Send Reminder", x: 420, y: 660, config: { channel: "EMAIL", template: DEFAULT_REMINDER_TEMPLATE } },
  ];

  const automation = await db.automation.create({
    data: {
      organizationId: auth.ctx.organizationId,
      businessId: business.id,
      name: parsed.data.name,
      status: "DRAFT",
      triggerType: "CUSTOMER_ADDED",
      nodes: { create: nodeDefs.map((n) => ({ type: n.type, label: n.label, positionX: n.x, positionY: n.y, config: n.config })) },
    },
    include: { nodes: true },
  });

  const idOf = (label: string) => automation.nodes.find((n) => n.label === label)!.id;
  const edges = [
    { id: "e1", source: idOf("Customer Added"), target: idOf("Wait 1 Day") },
    { id: "e2", source: idOf("Wait 1 Day"), target: idOf("Send Review Request") },
    { id: "e3", source: idOf("Send Review Request"), target: idOf("Wait 3 Days") },
    { id: "e4", source: idOf("Wait 3 Days"), target: idOf("Review Completed?") },
    { id: "e5", source: idOf("Review Completed?"), target: idOf("Stop"), sourceHandle: "yes" },
    { id: "e6", source: idOf("Review Completed?"), target: idOf("Send Reminder"), sourceHandle: "no" },
  ];
  await db.automation.update({ where: { id: automation.id }, data: { edges } });

  return Response.json({ ok: true, automationId: automation.id });
}
