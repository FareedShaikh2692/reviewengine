import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrgContext, getSessionUser } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { BusinessPicker } from "@/components/onboarding/business-picker";
import { createOrganizationFromPlaceId } from "@/lib/organizations";

export default async function OnboardingBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const ctx = await getOrgContext();
  const { place } = await searchParams;

  if (!ctx && place) {
    // Arrived here via Google OAuth with a pre-selected business (from the business preview CTA) — connect it automatically.
    const user = await getSessionUser();
    if (user) {
      let created = false;
      try {
        await createOrganizationFromPlaceId(user.id, place);
        created = true;
      } catch (err) {
        console.error("Failed to auto-connect business from place param", err);
      }
      if (created) redirect("/onboarding/business");
    }
  }

  if (!ctx) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Confirm your business</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Search for the business you selected, or set one up manually.
        </p>
        <BusinessPicker />
      </div>
    );
  }

  const business = await db.business.findFirst({
    where: { organizationId: ctx.organizationId },
    include: { locations: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Confirm your business</h1>
      <p className="mt-1.5 text-sm text-ink-500">This is the business we&apos;ll connect to your account.</p>

      {business && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-ink-900">{business.name}</h2>
          <p className="text-sm text-ink-500">{business.industry}</p>
          <div className="mt-4 space-y-2">
            {business.locations.map((loc) => (
              <div key={loc.id} className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-700">
                <MapPin className="h-3.5 w-3.5 text-ink-400" />
                {loc.name} — {loc.address || loc.city}
                {loc.isPrimary && <span className="ml-auto rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-medium text-white">Primary</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-8 flex justify-end">
        <Button size="lg" asChild>
          <Link href="/onboarding/profile">
            Continue <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
