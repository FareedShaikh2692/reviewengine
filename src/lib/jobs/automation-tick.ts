import { db } from "@/lib/db";
import { createReviewRequest } from "@/lib/review-requests";
import { notifyOrg } from "@/lib/notify";
import type { AutomationNode, Prisma } from "@/generated/prisma/client";

type Edge = { id: string; source: string; target: string; sourceHandle?: "yes" | "no" | null };

function nextEdgesFrom(edges: Edge[], nodeId: string, handle?: "yes" | "no") {
  return edges.filter((e) => e.source === nodeId && (handle ? e.sourceHandle === handle : !e.sourceHandle || e.sourceHandle === null));
}

export async function processAutomationTick() {
  const dueExecutions = await db.automationExecution.findMany({
    where: {
      status: { in: ["RUNNING", "WAITING"] },
      OR: [{ nextRunAt: null }, { nextRunAt: { lte: new Date() } }],
    },
    include: {
      customer: true,
      automation: { include: { nodes: true } },
    },
    take: 200,
  });

  for (const execution of dueExecutions) {
    try {
      await processOne(execution);
    } catch (err) {
      console.error(`[automation-tick] execution ${execution.id} failed`, err);
      const log = Array.isArray(execution.log) ? [...(execution.log as unknown[])] : [];
      log.push({ error: err instanceof Error ? err.message : String(err), at: new Date().toISOString() });
      await db.automationExecution.update({
        where: { id: execution.id },
        data: { status: "FAILED", log: log as Prisma.InputJsonValue },
      });
      await notifyOrg({
        organizationId: execution.customer.organizationId,
        type: "AUTOMATION_FAILED",
        title: "Automation failed",
        body: `"${execution.automation.name}" hit an error processing ${execution.customer.firstName} ${execution.customer.lastName ?? ""}.`.trim(),
        metadata: { automationId: execution.automationId, executionId: execution.id },
      });
    }
  }
}

type DueExecution = Awaited<ReturnType<typeof db.automationExecution.findMany<{
  include: { customer: true; automation: { include: { nodes: true } } };
}>>>[number];

async function processOne(execution: DueExecution) {
  const nodes = execution.automation.nodes;
  const edges = (execution.automation.edges as unknown as Edge[]) ?? [];
  const nodeById = new Map<string, AutomationNode>(nodes.map((n) => [n.id, n]));

  const currentNode: AutomationNode | undefined = execution.currentNodeId
    ? nodeById.get(execution.currentNodeId)
    : nodes.find((n) => n.type === "TRIGGER");

  if (!currentNode) {
    await db.automationExecution.update({ where: { id: execution.id }, data: { status: "COMPLETED", completedAt: new Date() } });
    return;
  }

  const log = Array.isArray(execution.log) ? [...(execution.log as unknown[])] : [];

  let advanced = false;
  let nextNodeId: string | undefined;

  if (currentNode.type === "WAIT") {
    const days = (currentNode.config as { days?: number })?.days ?? 1;
    const waitUntil = new Date(execution.startedAt.getTime() + days * 24 * 60 * 60 * 1000);
    if (waitUntil > new Date()) {
      await db.automationExecution.update({
        where: { id: execution.id },
        data: { status: "WAITING", nextRunAt: waitUntil, currentNodeId: currentNode.id },
      });
      return;
    }
    nextNodeId = nextEdgesFrom(edges, currentNode.id)[0]?.target;
    advanced = true;
  } else if (currentNode.type === "SEND_REQUEST" || currentNode.type === "SEND_REMINDER") {
    const config = currentNode.config as { channel?: "EMAIL" | "SMS" | "WHATSAPP"; template?: string };
    await createReviewRequest({
      organizationId: execution.customer.organizationId,
      businessId: execution.automation.businessId,
      customerId: execution.customerId,
      channel: config.channel ?? "EMAIL",
      template: config.template,
    });
    log.push({ nodeId: currentNode.id, action: currentNode.type, at: new Date().toISOString() });
    nextNodeId = nextEdgesFrom(edges, currentNode.id)[0]?.target;
    advanced = true;
  } else if (currentNode.type === "CONDITION") {
    const reviewed = execution.customer.status === "REVIEWED";
    nextNodeId = nextEdgesFrom(edges, currentNode.id, reviewed ? "yes" : "no")[0]?.target;
    advanced = true;
  } else if (currentNode.type === "STOP") {
    await db.automationExecution.update({
      where: { id: execution.id },
      data: { status: "COMPLETED", completedAt: new Date(), log: log as Prisma.InputJsonValue },
    });
    return;
  } else {
    // TRIGGER
    nextNodeId = nextEdgesFrom(edges, currentNode.id)[0]?.target;
    advanced = true;
  }

  if (!advanced || !nextNodeId) {
    await db.automationExecution.update({
      where: { id: execution.id },
      data: { status: "COMPLETED", completedAt: new Date(), log: log as Prisma.InputJsonValue },
    });
    return;
  }

  await db.automationExecution.update({
    where: { id: execution.id },
    data: { status: "RUNNING", currentNodeId: nextNodeId, nextRunAt: new Date(), log: log as Prisma.InputJsonValue },
  });
}
