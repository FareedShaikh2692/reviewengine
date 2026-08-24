"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

const STATUS_VARIANT: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  PENDING: "neutral",
  SENT: "info",
  DELIVERED: "info",
  OPENED: "warning",
  CLICKED: "warning",
  COMPLETED: "success",
  FAILED: "danger",
  UNSUBSCRIBED: "danger",
};

export type RequestRow = {
  id: string;
  channel: string;
  status: string;
  message: string;
  trackingToken: string;
  sentAt: string | null;
  completedAt: string | null;
  customerName: string;
  campaignName: string | null;
};

export function RequestsTable({ requests, appUrl }: { requests: RequestRow[]; appUrl: string }) {
  const [selected, setSelected] = useState<RequestRow | null>(null);

  const columns: DataTableColumn<RequestRow>[] = [
    { key: "customer", header: "Customer", render: (r) => <span className="font-medium text-ink-900">{r.customerName}</span> },
    { key: "channel", header: "Channel", render: (r) => <span className="text-ink-500">{r.channel}</span> },
    { key: "campaign", header: "Campaign", render: (r) => <span className="text-ink-500">{r.campaignName ?? "—"}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{r.status.replace(/_/g, " ")}</Badge>,
    },
    { key: "sent", header: "Sent", render: (r) => <span className="text-ink-500">{r.sentAt ? new Date(r.sentAt).toLocaleDateString() : "—"}</span> },
    {
      key: "completed",
      header: "Completed",
      render: (r) => <span className="text-ink-500">{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "—"}</span>,
    },
  ];

  return (
    <>
      <DataTable columns={columns} rows={requests} rowKey={(r) => r.id} onRowClick={setSelected} />

      <Drawer open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Message to {selected?.customerName}</DrawerTitle>
            <DrawerDescription>
              Sent via {selected?.channel} · <Badge variant={STATUS_VARIANT[selected?.status ?? ""] ?? "neutral"}>{selected?.status}</Badge>
            </DrawerDescription>
          </DrawerHeader>
          <div className="whitespace-pre-line rounded-xl bg-surface-muted p-4 text-sm text-ink-700">{selected?.message}</div>
          {selected && (
            <p className="mt-4 text-xs text-ink-400">
              Tracking link: {appUrl}/r/{selected.trackingToken}
            </p>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
