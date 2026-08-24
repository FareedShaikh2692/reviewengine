"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncReviewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/reviews/sync", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setResult(data.inserted > 0 ? `${data.inserted} new review(s) synced` : "No new reviews");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-ink-500">{result}</span>}
      <Button variant="secondary" size="sm" onClick={sync} disabled={loading}>
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> {loading ? "Syncing…" : "Sync reviews"}
      </Button>
    </div>
  );
}
