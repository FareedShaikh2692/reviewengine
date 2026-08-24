import Link from "next/link";
import { Users, Layers } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral",
  SCHEDULED: "info",
  RUNNING: "success",
  PAUSED: "warning",
  COMPLETED: "neutral",
};

export function CampaignCard({
  campaign,
}: {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    channel: string;
    steps: { id: string }[];
    _count: { enrollments: number };
  };
}) {
  return (
    <Link href={`/dashboard/campaigns/${campaign.id}`}>
      <Card className="h-full transition hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-ink-900">{campaign.name}</h3>
          <Badge variant={STATUS_VARIANT[campaign.status] ?? "neutral"}>{campaign.status}</Badge>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-ink-500">{campaign.description || "No description"}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> {campaign.steps.length} steps
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {campaign._count.enrollments} enrolled
          </span>
          <Badge variant="outline">{campaign.channel}</Badge>
        </div>
      </Card>
    </Link>
  );
}
