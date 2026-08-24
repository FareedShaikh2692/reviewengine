import { z } from "zod";
import { db } from "@/lib/db";
import { requireOrgContext, requirePermission, apiError, parseBody } from "@/lib/api";
import type { Prisma } from "@/generated/prisma/client";

const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(["TRIGGER", "WAIT", "SEND_REQUEST", "SEND_REMINDER", "CONDITION", "STOP"]),
  label: z.string(),
  config: z.record(z.string(), z.unknown()).default({}),
  positionX: z.number(),
  positionY: z.number(),
  isNew: z.boolean().optional(),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED"]).optional(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
  deletedNodeIds: z.array(z.string()).optional(),
});

export async function GET(request: Request, ctx: RouteContext<"/api/automations/[id]">) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const automation = await db.automation.findUnique({ where: { id }, include: { nodes: true } });
  if (!automation || automation.organizationId !== auth.ctx.organizationId) return apiError(404, "Automation not found.");

  return Response.json({ automation });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/automations/[id]">) {
  const auth = await requirePermission("MANAGE_AUTOMATIONS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const automation = await db.automation.findUnique({ where: { id } });
  if (!automation || automation.organizationId !== auth.ctx.organizationId) return apiError(404, "Automation not found.");

  const parsed = await parseBody(request, updateSchema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.deletedNodeIds?.length) {
    await db.automationNode.deleteMany({ where: { id: { in: parsed.data.deletedNodeIds }, automationId: id } });
  }

  if (parsed.data.nodes) {
    for (const node of parsed.data.nodes) {
      if (node.isNew) {
        const created = await db.automationNode.create({
          data: {
            automationId: id,
            type: node.type,
            label: node.label,
            config: node.config as Prisma.InputJsonValue,
            positionX: node.positionX,
            positionY: node.positionY,
          },
        });
        // Remap temp id -> real id inside edges before saving.
        if (parsed.data.edges) {
          for (const edge of parsed.data.edges) {
            if (edge.source === node.id) edge.source = created.id;
            if (edge.target === node.id) edge.target = created.id;
          }
        }
      } else {
        await db.automationNode.update({
          where: { id: node.id },
          data: { label: node.label, config: node.config as Prisma.InputJsonValue, positionX: node.positionX, positionY: node.positionY },
        });
      }
    }
  }

  await db.automation.update({
    where: { id },
    data: {
      name: parsed.data.name,
      status: parsed.data.status,
      edges: parsed.data.edges ?? undefined,
    },
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/automations/[id]">) {
  const auth = await requirePermission("MANAGE_AUTOMATIONS");
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  const automation = await db.automation.findUnique({ where: { id } });
  if (!automation || automation.organizationId !== auth.ctx.organizationId) return apiError(404, "Automation not found.");

  await db.automation.delete({ where: { id } });
  return Response.json({ ok: true });
}
