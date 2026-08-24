import { Star } from "lucide-react";
import { Card } from "@/components/ui/glass-card";

export function RatingDistributionCard({ data }: { data: { stars: number; count: number; pct: number }[] }) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-ink-900">Rating distribution</h3>
      <div className="mt-5 space-y-3">
        {data.map((d) => (
          <div key={d.stars} className="flex items-center gap-3 text-sm">
            <span className="flex w-10 shrink-0 items-center gap-0.5 text-ink-500">
              {d.stars} <Star className="h-3 w-3 fill-current text-amber-400" />
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.max(d.pct, 2)}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right font-medium text-ink-900">{d.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
