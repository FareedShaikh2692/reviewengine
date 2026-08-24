"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BusinessLocation } from "@/generated/prisma/client";

export function LocationsManager({ locations }: { locations: BusinessLocation[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "" });
  const [loading, setLoading] = useState(false);

  async function addLocation(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setForm({ name: "", address: "", city: "", phone: "" });
    setShowForm(false);
    router.refresh();
  }

  async function setPrimary(id: string) {
    await fetch(`/api/locations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this location?")) return;
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {locations.map((loc) => (
          <Card key={loc.id} className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient/10">
                <MapPin className="h-[18px] w-[18px]" style={{ color: "var(--brand-mid)" }} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">{loc.name}</p>
                  {loc.isPrimary && <Badge variant="brand">Primary</Badge>}
                </div>
                <p className="mt-1 text-xs text-ink-500">{loc.address || loc.city || "No address set"}</p>
                <p className="text-xs text-ink-500">{loc.phone}</p>
                <div className="mt-3 flex gap-3">
                  {!loc.isPrimary && (
                    <button onClick={() => setPrimary(loc.id)} className="flex items-center gap-1 text-xs font-medium text-brand-mid hover:underline">
                      <Star className="h-3 w-3" /> Make primary
                    </button>
                  )}
                  {!loc.isPrimary && (
                    <button onClick={() => remove(loc.id)} className="flex items-center gap-1 text-xs font-medium text-danger hover:underline">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showForm ? (
        <Card>
          <form onSubmit={addLocation} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="loc-name">Location name</Label>
              <Input id="loc-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="loc-phone">Phone</Label>
              <Input id="loc-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="loc-address">Address</Label>
              <Input id="loc-address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="loc-city">City</Label>
              <Input id="loc-city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding…" : "Add location"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add location
        </Button>
      )}
    </div>
  );
}
