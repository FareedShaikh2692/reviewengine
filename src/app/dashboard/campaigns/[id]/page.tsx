import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CampaignStatusControl } from "@/components/dashboard/campaigns/status-control";
import { Send, CheckCircle2, MousePointerClick, Eye, XCircle, Percent } from "lucide-react";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) return null;
  const { id } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      enrollments: { include: { customer: true }, orderBy: { enrolledAt: "desc" }, take: 50 },
    },
  });
  if (!campaign || campaign.organizationId !== ctx.organizationId) notFound();

  const requestStats = await db.reviewRequest.groupBy({ by: ["status"], where: { campaignId: id }, _count: true });
  const byStatus = Object.fromEntries(requestStats.map((r) => [r.status, r._count]));
  const recipients = campaign.enrollments.length;
  const sent = Object.values(byStatus).reduce((a: number, b) => a + (b as number), 0);
  const completed = byStatus.COMPLETED ?? 0;
  const conversion = sent > 0 ? (completed / sent) * 100 : 0;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/campaigns" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{campaign.name}</h1>
            <Badge variant={campaign.status === "RUNNING" ? "success" : "neutral"}>{campaign.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">{campaign.description}</p>
        </div>
        <CampaignStatusControl campaignId={campaign.id} status={campaign.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recipients" value={recipients.toLocaleString()} icon={Send} />
        <StatCard label="Delivered" value={((byStatus.DELIVERED ?? 0) + (byStatus.OPENED ?? 0) + (byStatus.CLICKED ?? 0) + completed).toLocaleString()} icon={Eye} />
        <StatCard label="Clicked" value={((byStatus.CLICKED ?? 0) + completed).toLocaleString()} icon={MousePointerClick} />
        <StatCard label="Review Completed" value={completed.toLocaleString()} icon={CheckCircle2} />
        <StatCard label="Conversion Rate" value={`${conversion.toFixed(0)}%`} icon={Percent} />
        <StatCard label="Failed" value={(byStatus.FAILED ?? 0).toLocaleString()} icon={XCircle} />
      </div>

      <Card>
        <h2 className="text-base font-semibold text-ink-900">Steps</h2>
        <div className="mt-4 space-y-3">
          {campaign.steps.map((s) => (
            <div key={s.id} className="rounded-xl bg-surface-muted p-3">
              <p className="text-sm font-medium text-ink-900">
                Day {s.dayOffset} — {s.type.replace(/_/g, " ")}
              </p>
              <p className="mt-1 whitespace-pre-line text-xs text-ink-500 line-clamp-3">{s.messageTemplate}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-ink-900">Enrolled customers</h2>
        <div className="mt-4 space-y-2">
          {campaign.enrollments.length === 0 && <p className="text-sm text-ink-500">No customers enrolled yet.</p>}
          {campaign.enrollments.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2.5 text-sm">
              <span className="font-medium text-ink-900">
                {e.customer.firstName} {e.customer.lastName}
              </span>
              <Badge variant={e.status === "COMPLETED" ? "success" : "info"}>{e.status.replace(/_/g, " ")}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
