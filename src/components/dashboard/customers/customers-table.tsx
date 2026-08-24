"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, Send, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { initials } from "@/lib/utils";

type CustomerRow = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: Date | string;
  lastReviewRequestAt: Date | string | null;
  tags: { tag: { id: string; name: string; color: string } }[];
};

const STATUS_VARIANT: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  NEW: "neutral",
  CONTACTED: "info",
  REVIEW_REQUESTED: "warning",
  CLICKED: "warning",
  REVIEWED: "success",
  UNSUBSCRIBED: "danger",
};

export function CustomersTable({
  customers,
  total,
  page,
  pageSize,
}: {
  customers: CustomerRow[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CustomerRow | null>(null);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  function goToPage(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`/dashboard/customers?${next.toString()}`);
  }

  async function sendRequest(id: string) {
    setBusyId(id);
    await fetch(`/api/customers/${id}/send-request`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setBusyId(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    await fetch(`/api/customers/${pendingDelete.id}`, { method: "DELETE" });
    setBusyId(null);
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-premium">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Tags</th>
              <th className="px-5 py-3">Last request</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                <td className="px-5 py-3.5">
                  <Link href={`/dashboard/customers/${c.id}`} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                      {initials(`${c.firstName} ${c.lastName ?? ""}`)}
                    </span>
                    <span className="font-medium text-ink-900">
                      {c.firstName} {c.lastName}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-ink-500">
                  <div>{c.email ?? "—"}</div>
                  <div className="text-xs">{c.phone ?? ""}</div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={STATUS_VARIANT[c.status] ?? "neutral"}>{c.status.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((t) => (
                      <span
                        key={t.tag.id}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: t.tag.color }}
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-500">
                  {c.lastReviewRequestAt ? new Date(c.lastReviewRequestAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3.5 text-ink-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={busyId === c.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/customers/${c.id}`}>
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/customers/${c.id}?edit=1`}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => sendRequest(c.id)}>
                        <Send className="h-3.5 w-3.5" /> Send Review Request
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-danger" onSelect={() => setPendingDelete(c)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-ink-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete customer</DialogTitle>
            <DialogDescription>
              {pendingDelete && (
                <>
                  This permanently deletes <strong>{pendingDelete.firstName} {pendingDelete.lastName}</strong> and their
                  review request history. This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button variant="danger" onClick={confirmDelete} disabled={busyId === pendingDelete?.id}>
              {busyId === pendingDelete?.id ? "Deleting…" : "Delete customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
