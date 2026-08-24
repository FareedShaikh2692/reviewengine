"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/generated/prisma/client";

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    company: customer.company ?? "",
    notes: customer.notes ?? "",
    status: customer.status,
    consentStatus: customer.consentStatus,
  });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    router.refresh();
  }

  async function sendRequest() {
    setSending(true);
    await fetch(`/api/customers/${customer.id}/send-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    setSending(false);
    router.refresh();
  }

  return (
    <Card>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}>
            {["NEW", "CONTACTED", "REVIEW_REQUESTED", "CLICKED", "REVIEWED", "UNSUBSCRIBED"].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="consentStatus">Consent</Label>
          <Select id="consentStatus" value={form.consentStatus} onChange={(e) => setForm((f) => ({ ...f, consentStatus: e.target.value as typeof f.consentStatus }))}>
            {["SUBSCRIBED", "UNSUBSCRIBED", "DO_NOT_CONTACT"].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </Select>
        </div>
      </div>
      <div className="mt-5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" disabled={saving} onClick={save}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button disabled={sending || form.consentStatus !== "SUBSCRIBED"} onClick={sendRequest}>
          <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send Review Request"}
        </Button>
      </div>
    </Card>
  );
}
