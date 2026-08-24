"use client";

import { useState } from "react";
import { Card } from "@/components/ui/glass-card";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

type Point = { date: string; totalReviews: number; averageRating: number };

export function ReviewGrowthChart({ initialSeries }: { initialSeries: Point[] }) {
  const [days, setDays] = useState(30);
  const [series, setSeries] = useState<Point[]>(initialSeries);
  const [loading, setLoading] = useState(false);

  function selectRange(nextDays: number) {
    setDays(nextDays);
    if (nextDays === 30) {
      setSeries(initialSeries);
      return;
    }
    setLoading(true);
    fetch(`/api/analytics/growth?days=${nextDays}`)
      .then((res) => res.json())
      .then((data) => setSeries(data.series))
      .finally(() => setLoading(false));
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Review growth</h3>
          <p className="text-xs text-ink-500">Total reviews over time</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => selectRange(r.days)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition",
                days === r.days ? "bg-surface text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className={cn("mt-4 transition-opacity", loading && "opacity-50")}>
        <AnalyticsChart data={series} xKey="date" yKey="totalReviews" variant="area" height={256} />
      </div>
    </Card>
  );
}
