import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { CampaignCard } from "@/components/dashboard/campaigns/campaign-card";

export default async function CampaignsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const campaigns = await db.campaign.findMany({
    where: { organizationId: ctx.organizationId },
    include: { steps: true, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Campaigns</h1>
          <p className="mt-1 text-sm text-ink-500">Automated, multi-step review-request sequences.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <Plus className="h-4 w-4" /> New Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create a campaign to automatically request reviews after every purchase."
          action={
            <Button asChild>
              <Link href="/dashboard/campaigns/new">
                <Plus className="h-4 w-4" /> New Campaign
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
