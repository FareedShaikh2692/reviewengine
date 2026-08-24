"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

type Results = {
  businesses: { id: string; name: string; organization: { id: string; name: string } }[];
  users: { id: string; name: string | null; email: string }[];
  customers: { id: string; firstName: string; lastName: string | null; email: string | null }[];
  campaigns: { id: string; name: string; status: string }[];
};

export function AdminSearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={search} className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search business, user, email, customer, campaign…" className="h-11" />
        <button type="submit" disabled={loading} className="flex h-11 items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-medium text-white">
          <Search className="h-4 w-4" /> Search
        </button>
      </form>

      {results && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Businesses</h3>
            <div className="mt-3 space-y-2">
              {results.businesses.map((b) => (
                <Link key={b.id} href={`/admin/businesses/${b.organization.id}`} className="block rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-700 hover:text-ink-900">
                  {b.name}
                </Link>
              ))}
              {results.businesses.length === 0 && <p className="text-xs text-ink-500">No matches</p>}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Users</h3>
            <div className="mt-3 space-y-2">
              {results.users.map((u) => (
                <div key={u.id} className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-700">
                  {u.name || u.email} <span className="text-ink-400">· {u.email}</span>
                </div>
              ))}
              {results.users.length === 0 && <p className="text-xs text-ink-500">No matches</p>}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Customers</h3>
            <div className="mt-3 space-y-2">
              {results.customers.map((c) => (
                <div key={c.id} className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-700">
                  {c.firstName} {c.lastName} <span className="text-ink-400">· {c.email}</span>
                </div>
              ))}
              {results.customers.length === 0 && <p className="text-xs text-ink-500">No matches</p>}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Campaigns</h3>
            <div className="mt-3 space-y-2">
              {results.campaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-700">
                  {c.name} <Badge variant="outline">{c.status}</Badge>
                </div>
              ))}
              {results.campaigns.length === 0 && <p className="text-xs text-ink-500">No matches</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
