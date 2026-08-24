"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewAutomationButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Customer Follow-up" }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push(`/dashboard/automations/${data.automationId}`);
  }

  return (
    <Button onClick={create} disabled={loading}>
      <Plus className="h-4 w-4" /> {loading ? "Creating…" : "New Automation"}
    </Button>
  );
}
