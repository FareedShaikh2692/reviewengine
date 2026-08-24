"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/generated/prisma/client";

export function BillingPlans({ plans, currentPlanKey }: { plans: Plan[]; currentPlanKey: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function choose(planKey: string) {
    setLoading(planKey);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    const data = await res.json();
    setLoading(null);
    if (res.ok && data.url) window.location.assign(data.url);
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const isCurrent = plan.key === currentPlanKey;
        const features = (plan.features as string[]) ?? [];
        return (
          <Card key={plan.id} className={isCurrent ? "ring-2 ring-brand-mid/40" : ""}>
            {isCurrent && <Badge variant="brand" className="mb-3">Current plan</Badge>}
            <p className="text-sm font-medium text-ink-500">{plan.name}</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">
              {plan.priceMonthly === 0 ? (plan.key === "ENTERPRISE" ? "Custom" : "$0") : `$${(plan.priceMonthly / 100).toFixed(0)}`}
              {plan.priceMonthly > 0 && <span className="text-sm font-normal text-ink-400">/mo</span>}
            </p>
            <ul className="mt-4 space-y-1.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-ink-500">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
            <Button
              variant={isCurrent ? "secondary" : "primary"}
              className="mt-5 w-full"
              disabled={isCurrent || loading !== null}
              onClick={() => choose(plan.key)}
            >
              {isCurrent ? "Current plan" : loading === plan.key ? "Redirecting…" : "Choose plan"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
