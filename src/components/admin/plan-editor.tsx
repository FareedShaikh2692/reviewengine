"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Users } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Plan = {
  id: string;
  key: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  stripePriceId: string | null;
  limits: Record<string, number>;
  features: string[];
};

const LIMIT_KEYS = ["businesses", "customers", "reviewRequests", "locations", "teamMembers"] as const;

export function PlanEditor({ plan, subscriberCount }: { plan: Plan; subscriberCount: number }) {
  const router = useRouter();
  const [name, setName] = useState(plan.name);
  const [priceMonthly, setPriceMonthly] = useState(plan.priceMonthly / 100);
  const [priceYearly, setPriceYearly] = useState(plan.priceYearly / 100);
  const [isActive, setIsActive] = useState(plan.isActive);
  const [stripePriceId, setStripePriceId] = useState(plan.stripePriceId ?? "");
  const [limits, setLimits] = useState(plan.limits);
  const [features, setFeatures] = useState(plan.features.join(", "));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        priceMonthly: Math.round(priceMonthly * 100),
        priceYearly: Math.round(priceYearly * 100),
        isActive,
        stripePriceId: stripePriceId || null,
        limits,
        features: features.split(",").map((f) => f.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-ink-900">{plan.key}</h2>
          <Badge variant={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Hidden"}</Badge>
        </div>
        <span className="flex items-center gap-1 text-xs text-ink-500">
          <Users className="h-3.5 w-3.5" /> {subscriberCount} subscribed
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${plan.id}-name`}>Display name</Label>
          <Input id={`${plan.id}-name`} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[var(--brand-mid)]" />
            Visible on pricing page
          </label>
        </div>
        <div>
          <Label htmlFor={`${plan.id}-monthly`}>Price / month (USD)</Label>
          <Input id={`${plan.id}-monthly`} type="number" min={0} value={priceMonthly} onChange={(e) => setPriceMonthly(Number(e.target.value))} />
        </div>
        <div>
          <Label htmlFor={`${plan.id}-yearly`}>Price / year (USD)</Label>
          <Input id={`${plan.id}-yearly`} type="number" min={0} value={priceYearly} onChange={(e) => setPriceYearly(Number(e.target.value))} />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor={`${plan.id}-stripe`}>Stripe Price ID</Label>
        <Input id={`${plan.id}-stripe`} placeholder="price_…" value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} />
        <p className="mt-1 text-xs text-ink-400">Required for real checkout once Stripe is connected; ignored in dev billing mode.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LIMIT_KEYS.map((key) => (
          <div key={key}>
            <Label htmlFor={`${plan.id}-${key}`}>{key} (-1 = unlimited)</Label>
            <Input
              id={`${plan.id}-${key}`}
              type="number"
              value={limits[key] ?? 0}
              onChange={(e) => setLimits((l) => ({ ...l, [key]: Number(e.target.value) }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Label htmlFor={`${plan.id}-features`}>Features (comma separated)</Label>
        <Input id={`${plan.id}-features`} value={features} onChange={(e) => setFeatures(e.target.value)} />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button size="sm" disabled={saving} onClick={save}>
          <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save plan"}
        </Button>
        {saved && <span className="text-xs text-success">Saved</span>}
      </div>
    </Card>
  );
}
