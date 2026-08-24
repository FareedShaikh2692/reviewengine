"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

export function ProfileSettingsForm({ user }: { user: { name: string; email: string; phone: string } }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card className="max-w-xl">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
          {initials(name || user.email)}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">{name || user.email}</p>
          <p className="text-xs text-ink-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button disabled={saving} onClick={save}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && <span className="text-sm text-success">Saved</span>}
      </div>
    </Card>
  );
}
