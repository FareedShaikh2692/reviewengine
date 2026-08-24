"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/glass-card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    serviceProduct: "",
    purchaseDate: "",
    notes: "",
    tags: "",
  });
  const [loading, setLoading] = useState<"save" | "save-send" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(sendReviewRequest: boolean) {
    setLoading(sendReviewRequest ? "save-send" : "save");
    setError(null);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sendReviewRequest,
      }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/dashboard/customers");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/customers" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">Add customer</h1>

      <Card className="mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="serviceProduct">Service / Product</Label>
              <Input id="serviceProduct" value={form.serviceProduct} onChange={(e) => set("serviceProduct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="purchaseDate">Purchase date</Label>
              <Input id="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="VIP, Regular" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button type="submit" variant="secondary" disabled={loading !== null}>
              <Save className="h-4 w-4" /> {loading === "save" ? "Saving…" : "Save Customer"}
            </Button>
            <Button type="button" disabled={loading !== null} onClick={() => submit(true)}>
              <Send className="h-4 w-4" /> {loading === "save-send" ? "Sending…" : "Save & Send Review Request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
