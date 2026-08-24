"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function RatingFilter({
  currentRating,
  currentPlatform,
  platforms,
}: {
  currentRating?: string;
  currentPlatform?: string;
  platforms: { id: string; name: string }[];
}) {
  const router = useRouter();

  function update(rating?: string, platform?: string) {
    const params = new URLSearchParams();
    if (rating) params.set("rating", rating);
    if (platform) params.set("platform", platform);
    router.push(`/dashboard/reviews?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => update(undefined, currentPlatform)}
          className={cn("rounded-full px-3 py-1 text-xs font-medium", !currentRating ? "bg-brand-gradient text-white" : "bg-surface-muted text-ink-500")}
        >
          All ratings
        </button>
        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => update(String(r), currentPlatform)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              currentRating === String(r) ? "bg-brand-gradient text-white" : "bg-surface-muted text-ink-500"
            )}
          >
            {r}★
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => update(currentRating, undefined)}
          className={cn("rounded-full px-3 py-1 text-xs font-medium", !currentPlatform ? "bg-brand-gradient text-white" : "bg-surface-muted text-ink-500")}
        >
          All platforms
        </button>
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => update(currentRating, p.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              currentPlatform === p.id ? "bg-brand-gradient text-white" : "bg-surface-muted text-ink-500"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
