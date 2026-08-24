"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Rocket, Save } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_REQUEST_TEMPLATE, DEFAULT_REMINDER_TEMPLATE } from "@/lib/message-template";

type Step = { dayOffset: number; type: "SEND_REQUEST" | "REMINDER"; messageTemplate: string };

const STATUS_OPTIONS = ["NEW", "CONTACTED", "REVIEW_REQUESTED", "CLICKED"];

export function CampaignBuilder() {
  const router = useRouter();
  const [name, setName] = useState("Post-Purchase Review Campaign");
  const [description, setDescription] = useState("Automatically requests a review after every visit, with reminders.");
  const [channel, setChannel] = useState<"EMAIL" | "SMS" | "WHATSAPP">("EMAIL");
  const [audience, setAudience] = useState<string[]>(["NEW"]);
  const [steps, setSteps] = useState<Step[]>([
    { dayOffset: 0, type: "SEND_REQUEST", messageTemplate: DEFAULT_REQUEST_TEMPLATE },
    { dayOffset: 3, type: "REMINDER", messageTemplate: DEFAULT_REMINDER_TEMPLATE },
    { dayOffset: 7, type: "REMINDER", messageTemplate: DEFAULT_REMINDER_TEMPLATE },
  ]);
  const [saving, setSaving] = useState<"draft" | "launch" | null>(null);

  function updateStep(i: number, patch: Partial<Step>) {
    setSteps((s) => s.map((step, idx) => (idx === i ? { ...step, ...patch } : step)));
  }

  function addStep() {
    setSteps((s) => [...s, { dayOffset: (s.at(-1)?.dayOffset ?? 0) + 4, type: "REMINDER", messageTemplate: DEFAULT_REMINDER_TEMPLATE }]);
  }

  async function save(launch: boolean) {
    setSaving(launch ? "launch" : "draft");
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, channel, audienceStatuses: audience, steps, launch }),
    });
    setSaving(null);
    if (res.ok) router.push("/dashboard/campaigns");
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-base font-semibold text-ink-900">Campaign details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Campaign name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select id="channel" value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
            </Select>
          </div>
          <div>
            <Label>Audience</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAudience((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]))}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    audience.includes(s) ? "bg-brand-gradient text-white" : "bg-surface-muted text-ink-500"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Steps</h2>
          <Button variant="secondary" size="sm" type="button" onClick={addStep}>
            <Plus className="h-3.5 w-3.5" /> Add step
          </Button>
        </div>
        <div className="mt-4 space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-ink-900">Day {step.dayOffset}</span>
                  <Select value={step.type} onChange={(e) => updateStep(i, { type: e.target.value as Step["type"] })} className="h-8 w-40 text-xs">
                    <option value="SEND_REQUEST">Send request</option>
                    <option value="REMINDER">Reminder</option>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    value={step.dayOffset}
                    onChange={(e) => updateStep(i, { dayOffset: Number(e.target.value) })}
                    className="h-8 w-20 text-xs"
                  />
                </div>
                {steps.length > 1 && (
                  <Button variant="ghost" size="icon" type="button" onClick={() => setSteps((s) => s.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                )}
              </div>
              <Textarea
                className="mt-3"
                value={step.messageTemplate}
                onChange={(e) => updateStep(i, { messageTemplate: e.target.value })}
                rows={5}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" disabled={saving !== null} onClick={() => save(false)}>
          <Save className="h-4 w-4" /> {saving === "draft" ? "Saving…" : "Save as Draft"}
        </Button>
        <Button disabled={saving !== null} onClick={() => save(true)}>
          <Rocket className="h-4 w-4" /> {saving === "launch" ? "Launching…" : "Save & Launch"}
        </Button>
      </div>
    </div>
  );
}
