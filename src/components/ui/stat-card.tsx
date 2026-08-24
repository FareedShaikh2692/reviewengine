import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/glass-card";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient/10 text-brand-mid">
            <Icon className="h-[18px] w-[18px]" style={{ color: "var(--brand-mid)" }} />
          </div>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
      {delta !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium">
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
              positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-ink-400">{deltaLabel}</span>}
        </div>
      )}
    </Card>
  );
}
