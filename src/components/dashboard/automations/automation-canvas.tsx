"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { nanoid } from "nanoid";
import { Zap, Clock, Send, Bell, GitBranch, Octagon, Save, Play, Pause, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { AutomationNodeCard, type AutomationNodeData } from "./automation-node";

const nodeTypes = { automation: AutomationNodeCard };

const PALETTE = [
  { type: "WAIT", label: "Wait", icon: Clock, config: { days: 1 } },
  { type: "SEND_REQUEST", label: "Send Review Request", icon: Send, config: { channel: "EMAIL", template: "Hi {{customer_name}}, please review us: {{review_link}}" } },
  { type: "SEND_REMINDER", label: "Send Reminder", icon: Bell, config: { channel: "EMAIL", template: "Just a reminder — {{review_link}}" } },
  { type: "CONDITION", label: "Review Completed?", icon: GitBranch, config: {} },
  { type: "STOP", label: "Stop", icon: Octagon, config: {} },
] as const;

type DbNode = { id: string; type: string; label: string; config: unknown; positionX: number; positionY: number };
type DbEdge = { id: string; source: string; target: string; sourceHandle?: string | null };

export function AutomationCanvas({
  automationId,
  status,
  initialNodes,
  initialEdges,
}: {
  automationId: string;
  status: string;
  initialNodes: DbNode[];
  initialEdges: DbEdge[];
}) {
  const router = useRouter();

  const toFlowNode = (n: DbNode): Node<AutomationNodeData> => ({
    id: n.id,
    type: "automation",
    position: { x: n.positionX, y: n.positionY },
    data: { type: n.type, label: n.label },
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.map(toFlowNode));
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle ?? undefined, animated: true, style: { stroke: "var(--border)" } }))
  );
  const [configs, setConfigs] = useState<Record<string, Record<string, unknown>>>(
    Object.fromEntries(initialNodes.map((n) => [n.id, (n.config as Record<string, unknown>) ?? {}]))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [automationStatus, setAutomationStatus] = useState(status);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedId) ?? null, [nodes, selectedId]);

  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: "var(--border)" } }, eds)), [setEdges]);

  function addNode(type: (typeof PALETTE)[number]) {
    const id = `new-${nanoid(8)}`;
    const newNode: Node<AutomationNodeData> = {
      id,
      type: "automation",
      position: { x: 480, y: 100 + nodes.length * 40 },
      data: { type: type.type, label: type.label },
    };
    setNodes((nds) => [...nds, newNode]);
    setConfigs((c) => ({ ...c, [id]: { ...type.config } }));
  }

  function deleteSelected() {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    if (!selectedId.startsWith("new-")) setDeletedIds((ids) => [...ids, selectedId]);
    setSelectedId(null);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/automations/${automationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.type,
          label: n.data.label,
          config: configs[n.id] ?? {},
          positionX: n.position.x,
          positionY: n.position.y,
          isNew: n.id.startsWith("new-"),
        })),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle })),
        deletedNodeIds: deletedIds,
      }),
    });
    setSaving(false);
    router.refresh();
  }

  async function toggleStatus() {
    const next = automationStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setAutomationStatus(next);
    await fetch(`/api/automations/${automationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      <div className="flex w-56 shrink-0 flex-col gap-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-ink-400">Add node</p>
        {PALETTE.map((p) => (
          <button
            key={p.type}
            onClick={() => addNode(p)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-xs font-medium text-ink-700 shadow-sm transition hover:border-brand-mid hover:text-ink-900"
          >
            <p.icon className="h-3.5 w-3.5 text-brand-mid" /> {p.label}
            <Plus className="ml-auto h-3 w-3 text-ink-400" />
          </button>
        ))}

        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1" disabled={saving} onClick={save}>
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
        <Button size="sm" variant="secondary" onClick={toggleStatus}>
          {automationStatus === "ACTIVE" ? (
            <>
              <Pause className="h-3.5 w-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> Activate
            </>
          )}
        </Button>
        <Badge variant={automationStatus === "ACTIVE" ? "success" : "neutral"} className="justify-center">
          {automationStatus}
        </Badge>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-surface-muted/40">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
          fitView
        >
          <Background gap={20} color="var(--border)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="!bg-surface" />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="w-72 shrink-0 space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-premium">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
              <Zap className="h-3 w-3" /> {selectedNode.data.type.replace(/_/g, " ")}
            </p>
            <button onClick={deleteSelected} className="text-xs font-medium text-danger hover:underline">
              Delete
            </button>
          </div>
          <div>
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label}
              onChange={(e) =>
                setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n)))
              }
            />
          </div>

          {selectedNode.data.type === "WAIT" && (
            <div>
              <Label htmlFor="wait-days">Wait (days)</Label>
              <Input
                id="wait-days"
                type="number"
                min={0}
                value={(configs[selectedNode.id]?.days as number) ?? 1}
                onChange={(e) => setConfigs((c) => ({ ...c, [selectedNode.id]: { ...c[selectedNode.id], days: Number(e.target.value) } }))}
              />
            </div>
          )}

          {(selectedNode.data.type === "SEND_REQUEST" || selectedNode.data.type === "SEND_REMINDER") && (
            <>
              <div>
                <Label htmlFor="channel">Channel</Label>
                <Select
                  id="channel"
                  value={(configs[selectedNode.id]?.channel as string) ?? "EMAIL"}
                  onChange={(e) => setConfigs((c) => ({ ...c, [selectedNode.id]: { ...c[selectedNode.id], channel: e.target.value } }))}
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="template">Message</Label>
                <Textarea
                  id="template"
                  rows={6}
                  value={(configs[selectedNode.id]?.template as string) ?? ""}
                  onChange={(e) => setConfigs((c) => ({ ...c, [selectedNode.id]: { ...c[selectedNode.id], template: e.target.value } }))}
                />
              </div>
            </>
          )}

          {selectedNode.data.type === "CONDITION" && (
            <p className="text-xs text-ink-500">
              Branches based on whether the customer has left a review. Connect the <span className="text-success">Yes</span> handle to a
              Stop node and the <span className="text-danger">No</span> handle to a reminder.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
