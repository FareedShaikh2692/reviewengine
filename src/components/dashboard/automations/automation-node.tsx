import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Zap, Clock, Send, Bell, GitBranch, Octagon } from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_META: Record<string, { icon: typeof Zap; color: string }> = {
  TRIGGER: { icon: Zap, color: "#6366f1" },
  WAIT: { icon: Clock, color: "#f59e0b" },
  SEND_REQUEST: { icon: Send, color: "#22c55e" },
  SEND_REMINDER: { icon: Bell, color: "#0ea5e9" },
  CONDITION: { icon: GitBranch, color: "#8b5cf6" },
  STOP: { icon: Octagon, color: "#ef4444" },
};

export type AutomationNodeData = { type: string; label: string; selected?: boolean };

export const AutomationNodeCard = memo(({ data, selected }: NodeProps<AutomationNodeData>) => {
  const meta = NODE_META[data.type] ?? NODE_META.WAIT;
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "w-56 rounded-2xl border bg-surface px-4 py-3 shadow-premium transition",
        selected ? "border-brand-mid ring-2 ring-brand-mid/30" : "border-border"
      )}
    >
      {data.type !== "TRIGGER" && <Handle type="target" position={Position.Top} className="!bg-ink-400" />}
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}1a` }}>
          <Icon className="h-4 w-4" style={{ color: meta.color }} />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-400">{data.type.replace(/_/g, " ")}</p>
          <p className="text-sm font-medium text-ink-900">{data.label}</p>
        </div>
      </div>
      {data.type === "CONDITION" ? (
        <>
          <Handle type="source" position={Position.Bottom} id="yes" style={{ left: "30%" }} className="!bg-success" />
          <Handle type="source" position={Position.Bottom} id="no" style={{ left: "70%" }} className="!bg-danger" />
          <div className="mt-2 flex justify-between text-[10px] font-medium">
            <span className="text-success">Yes</span>
            <span className="text-danger">No</span>
          </div>
        </>
      ) : (
        data.type !== "STOP" && <Handle type="source" position={Position.Bottom} className="!bg-ink-400" />
      )}
    </div>
  );
});
AutomationNodeCard.displayName = "AutomationNodeCard";
