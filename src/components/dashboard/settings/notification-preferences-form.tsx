"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { key: "email", label: "Email notifications", description: "Receive notifications via email in addition to in-app." },
  { key: "newReview", label: "New review detected", description: "Notify when a new review comes in." },
  { key: "campaignActivity", label: "Campaign activity", description: "Notify on campaign completion or failures." },
  { key: "productUpdates", label: "Product updates", description: "Occasional updates about new Review Engine features." },
];

export function NotificationPreferencesForm({ prefs }: { prefs: Record<string, boolean> }) {
  const [form, setForm] = useState(prefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationPreferences: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card className="max-w-xl">
      <div className="space-y-4">
        {OPTIONS.map((opt) => (
          <label key={opt.key} className="flex items-center justify-between gap-4 rounded-xl bg-surface-muted px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-900">{opt.label}</p>
              <p className="text-xs text-ink-500">{opt.description}</p>
            </div>
            <input
              type="checkbox"
              checked={form[opt.key] ?? false}
              onChange={(e) => setForm((f) => ({ ...f, [opt.key]: e.target.checked }))}
              className="h-5 w-5 accent-[var(--brand-mid)]"
            />
          </label>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button disabled={saving} onClick={save}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save preferences"}
        </Button>
        {saved && <span className="text-sm text-success">Saved</span>}
      </div>
    </Card>
  );
}
