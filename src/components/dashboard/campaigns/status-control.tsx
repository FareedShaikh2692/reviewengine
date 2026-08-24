"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CampaignStatusControl({ campaignId, status }: { campaignId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: string) {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === "DRAFT" || status === "PAUSED" || status === "SCHEDULED") {
    return (
      <Button size="sm" disabled={loading} onClick={() => setStatus("RUNNING")}>
        <Play className="h-3.5 w-3.5" /> {status === "PAUSED" ? "Resume" : "Launch"}
      </Button>
    );
  }
  if (status === "RUNNING") {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={loading} onClick={() => setStatus("PAUSED")}>
          <Pause className="h-3.5 w-3.5" /> Pause
        </Button>
        <Button size="sm" variant="secondary" disabled={loading} onClick={() => setStatus("COMPLETED")}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
        </Button>
      </div>
    );
  }
  return null;
}
