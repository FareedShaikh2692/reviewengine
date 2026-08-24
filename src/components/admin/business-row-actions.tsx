"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, UserCog, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/input";

const PLANS = ["FREE", "GROWTH", "PRO", "ENTERPRISE"];

export function BusinessRowActions({ orgId, status, currentPlanKey }: { orgId: string; status: string; currentPlanKey: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function impersonate() {
    setLoading(true);
    await fetch(`/api/admin/businesses/${orgId}/impersonate`, { method: "POST" });
    router.push("/dashboard");
    router.refresh();
  }

  async function toggleStatus() {
    setLoading(true);
    await fetch(`/api/admin/businesses/${orgId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function changePlan(planKey: string) {
    setLoading(true);
    await fetch(`/api/admin/businesses/${orgId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={`/admin/businesses/${orgId}`}>
            <Eye className="h-3.5 w-3.5" /> View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={impersonate}>
          <UserCog className="h-3.5 w-3.5" /> Impersonate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={toggleStatus}>
          {status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {status === "ACTIVE" ? "Suspend" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2.5 py-1.5 text-xs text-ink-400">Change plan</div>
        <div className="px-2.5 pb-1.5">
          <Select value={currentPlanKey} onChange={(e) => changePlan(e.target.value)} className="h-8 text-xs">
            {PLANS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
