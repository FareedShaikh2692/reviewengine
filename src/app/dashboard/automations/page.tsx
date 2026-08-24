import { Workflow } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Card } from "@/components/ui/glass-card";
import Link from "next/link";
import { NewAutomationButton } from "@/components/dashboard/automations/new-automation-button";

export default async function AutomationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const automations = await db.automation.findMany({
    where: { organizationId: ctx.organizationId },
    include: { _count: { select: { nodes: true, executions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Automations</h1>
          <p className="mt-1 text-sm text-ink-500">Visual, node-based follow-up workflows.</p>
        </div>
        <NewAutomationButton />
      </div>

      {automations.length === 0 ? (
        <EmptyState icon={Workflow} title="No automations yet" description="Create your first automation to follow up with customers automatically." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map((a) => (
            <Link key={a.id} href={`/dashboard/automations/${a.id}`}>
              <Card className="h-full transition hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-ink-900">{a.name}</h3>
                  <Badge variant={a.status === "ACTIVE" ? "success" : a.status === "PAUSED" ? "warning" : "neutral"}>{a.status}</Badge>
                </div>
                <p className="mt-3 text-xs text-ink-500">
                  {a._count.nodes} nodes · {a._count.executions} customers in flight
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
