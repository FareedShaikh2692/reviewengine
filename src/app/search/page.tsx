"use client";

import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { BusinessCard } from "@/components/business/business-card";
import type { BusinessSearchResult } from "@/lib/integrations/google-places";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessSearchResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  const runSearchCore = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setResults(data.results);
      setIsMock(Boolean(data.results?.[0]?.isMock));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSearch = useCallback(
    (q: string) => {
      setLoading(true);
      setError(null);
      void runSearchCore(q);
    },
    [runSearchCore]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount; state updates happen after the awaited request, not synchronously.
    void runSearchCore("");
  }, [runSearchCore]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">
        <section className="border-b border-border bg-background py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Search your business
            </h1>
            <p className="mt-3 text-ink-500">Find your business to see its current reviews and get started.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(query);
              }}
              className="mt-8 flex gap-2"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='e.g. "ABC Restaurant Dubai"'
                className="h-12 flex-1 rounded-xl text-base"
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
                Search Business
              </Button>
            </form>
            {isMock && (
              <p className="mt-4 text-xs text-ink-400">
                Showing sample businesses — connect a Google Places API key to search real businesses.
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          {loading && !results && <LoadingState label="Searching businesses…" />}
          {error && <ErrorState description={error} onRetry={() => runSearch(query)} />}
          {!error && results && results.length === 0 && (
            <EmptyState title="No businesses found" description="Try a different name or location." />
          )}
          {!error && results && results.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((business) => (
                <BusinessCard key={business.placeId} business={business} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
