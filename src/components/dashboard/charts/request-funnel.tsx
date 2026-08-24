import { Card } from "@/components/ui/glass-card";

export function RequestFunnelChart({ data }: { data: { stage: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Card>
      <h3 className="text-base font-semibold text-ink-900">Review requests</h3>
      <p className="text-xs text-ink-500">Sent → delivered → opened → clicked → completed</p>
      <div className="mt-5 space-y-3">
        {data.map((d) => (
          <div key={d.stage} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-ink-500">{d.stage}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.max((d.value / max) * 100, 3)}%` }} />
            </div>
            <span className="w-12 shrink-0 text-right font-medium text-ink-900">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
