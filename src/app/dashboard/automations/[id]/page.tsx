import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { AutomationCanvas } from "@/components/dashboard/automations/automation-canvas";

export default async function AutomationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) return null;
  const { id } = await params;

  const automation = await db.automation.findUnique({ where: { id }, include: { nodes: true } });
  if (!automation || automation.organizationId !== ctx.organizationId) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href="/dashboard/automations" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to automations
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">{automation.name}</h1>
      </div>

      <AutomationCanvas
        automationId={automation.id}
        status={automation.status}
        initialNodes={automation.nodes.map((n) => ({
          id: n.id,
          type: n.type,
          label: n.label,
          config: n.config,
          positionX: n.positionX,
          positionY: n.positionY,
        }))}
        initialEdges={(automation.edges as unknown as { id: string; source: string; target: string; sourceHandle?: string | null }[]) ?? []}
      />
    </div>
  );
}
