import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Phone, Globe, TrendingUp, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBusinessDetails, ratingDistributionFor } from "@/lib/integrations/google-places";

export default async function BusinessPreviewPage({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const business = await getBusinessDetails(placeId);
  if (!business) notFound();

  const dist = ratingDistributionFor(business.rating, business.reviewCount);
  const bars = [
    { stars: 5, count: dist.five },
    { stars: 4, count: dist.four },
    { stars: 3, count: dist.three },
    { stars: 2, count: dist.two },
    { stars: 1, count: dist.one },
  ];
  const max = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">
        <section className="border-b border-border bg-background py-14">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <Badge variant="outline" className="mb-3">{business.category}</Badge>
                <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{business.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-500">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {business.address || business.city}
                  </span>
                  {business.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {business.phone}
                    </span>
                  )}
                  {business.website && (
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> {business.website.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-3 shadow-premium">
                <span className="text-3xl font-semibold text-ink-900">{business.rating.toFixed(1)}</span>
                <div>
                  <span className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(business.rating) ? "fill-current" : "fill-none stroke-current opacity-30"}`} />
                    ))}
                  </span>
                  <p className="text-xs text-ink-500">{business.reviewCount.toLocaleString()} total reviews</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <h2 className="text-base font-semibold text-ink-900">Review distribution</h2>
              <div className="mt-5 space-y-3">
                {bars.map((b) => (
                  <div key={b.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-10 shrink-0 text-ink-500">{b.stars}★</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${Math.max((b.count / max) * 100, 3)}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-ink-500">{b.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col justify-between lg:col-span-2">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient/10">
                  <TrendingUp className="h-5 w-5" style={{ color: "var(--brand-mid)" }} />
                </div>
                <h2 className="mt-4 text-base font-semibold text-ink-900">Review trend</h2>
                <p className="mt-2 text-sm text-ink-500">
                  Businesses using Review Engine typically see review volume grow 20-40% within 90 days of launching
                  automated requests.
                </p>
              </div>
              <Button size="lg" className="mt-6 w-full" asChild>
                <Link href={`/auth/signup?place=${placeId}`}>
                  Get More Reviews <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>

          <Card className="mt-6">
            <h2 className="text-base font-semibold text-ink-900">Business information</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-400">Category</dt>
                <dd className="mt-0.5 text-ink-900">{business.category}</dd>
              </div>
              <div>
                <dt className="text-ink-400">Address</dt>
                <dd className="mt-0.5 text-ink-900">{business.address || business.city}</dd>
              </div>
              <div>
                <dt className="text-ink-400">Phone</dt>
                <dd className="mt-0.5 text-ink-900">{business.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-400">Website</dt>
                <dd className="mt-0.5 text-ink-900">{business.website ?? "—"}</dd>
              </div>
            </dl>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
