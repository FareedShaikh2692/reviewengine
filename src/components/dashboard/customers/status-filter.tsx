"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUSES = ["NEW", "CONTACTED", "REVIEW_REQUESTED", "CLICKED", "REVIEWED", "UNSUBSCRIBED"];

export function CustomerStatusFilter({ current }: { current?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function setStatus(status?: string) {
    const next = new URLSearchParams(params.toString());
    if (status) next.set("status", status);
    else next.delete("status");
    next.delete("page");
    router.push(`/dashboard/customers?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => setStatus(undefined)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition",
          !current ? "bg-brand-gradient text-white" : "bg-surface-muted text-ink-500 hover:text-ink-900"
        )}
      >
        All
      </button>
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => setStatus(s)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            current === s ? "bg-brand-gradient text-white" : "bg-surface-muted text-ink-500 hover:text-ink-900"
          )}
        >
          {s.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
