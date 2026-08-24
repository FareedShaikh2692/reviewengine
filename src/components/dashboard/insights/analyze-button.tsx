"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyzeButton({ pending }: { pending: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    await fetch("/api/insights/analyze", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button onClick={analyze} disabled={loading || pending === 0}>
      <Sparkles className="h-4 w-4" />
      {loading ? "Analyzing…" : pending > 0 ? `Analyze ${pending} new reviews` : "All reviews analyzed"}
    </Button>
  );
}
