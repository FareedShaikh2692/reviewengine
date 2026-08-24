import Link from "next/link";
import { Star, MapPin, Phone, Globe } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BusinessSearchResult } from "@/lib/integrations/google-places";

export function BusinessCard({ business }: { business: BusinessSearchResult }) {
  return (
    <Card className="flex flex-col transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink-900">{business.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-700">
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(business.rating) ? "fill-current" : "fill-none stroke-current opacity-30"}`} />
              ))}
            </span>
            <span className="font-medium text-ink-900">{business.rating.toFixed(1)}</span>
            <span className="text-ink-400">· {business.reviewCount.toLocaleString()} reviews</span>
          </div>
        </div>
        <Badge variant="outline">{business.category}</Badge>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-ink-500">
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {business.address || business.city}
        </p>
        {business.phone && (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" /> {business.phone}
          </p>
        )}
        {business.website && (
          <p className="flex items-center gap-2 truncate">
            <Globe className="h-3.5 w-3.5 shrink-0" /> {business.website.replace(/^https?:\/\//, "")}
          </p>
        )}
      </div>

      <Button className="mt-5 w-full" asChild>
        <Link href={`/business/${business.placeId}`}>Select Business</Link>
      </Button>
    </Card>
  );
}
