"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INDUSTRIES } from "@/lib/constants";
import type { Business, BusinessLocation } from "@/generated/prisma/client";

export function ProfileForm({ business, location }: { business: Business; location?: BusinessLocation }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: business.name,
    industry: business.industry ?? INDUSTRIES[0],
    description: business.description ?? "",
    phone: business.phone ?? "",
    website: business.website ?? "",
    logoUrl: business.logoUrl ?? "",
    address: location?.address ?? "",
    city: location?.city ?? "",
  });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) router.push("/onboarding/integrations");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Business name</Label>
          <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select id="industry" value={form.industry} onChange={(e) => set("industry", e.target.value)}>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What makes your business great?" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
      </div>
      <div className="flex justify-end pt-2">
        <Button size="lg" type="submit" disabled={loading}>
          {loading ? "Saving…" : "Continue"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
