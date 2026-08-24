"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/glass-card";
import type { BusinessSearchResult } from "@/lib/integrations/google-places";

export function BusinessPicker() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [manualName, setManualName] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  async function search() {
    setLoading(true);
    const res = await fetch(`/api/public/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }

  async function connect(placeId?: string, name?: string) {
    setConnecting(true);
    const res = await fetch("/api/onboarding/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, manualName: name }),
    });
    setConnecting(false);
    if (res.ok) router.push("/onboarding/profile");
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for your business" />
        <Button type="button" onClick={search} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <Card key={r.placeId} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">{r.name}</p>
                <p className="text-xs text-ink-500">{r.category} · {r.city}</p>
              </div>
              <Button size="sm" disabled={connecting} onClick={() => connect(r.placeId)}>
                Select
              </Button>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-border p-5">
        <p className="text-sm font-medium text-ink-700">Can&apos;t find your business?</p>
        <div className="mt-3 flex gap-2">
          <Input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Enter your business name" />
          <Button type="button" variant="secondary" disabled={!manualName || connecting} onClick={() => connect(undefined, manualName)}>
            Set up manually
          </Button>
        </div>
      </div>
    </div>
  );
}
