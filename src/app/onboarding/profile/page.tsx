import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/onboarding/profile-form";

export default async function OnboardingProfilePage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/business");

  const business = await db.business.findFirst({
    where: { organizationId: ctx.organizationId },
    include: { locations: { where: { isPrimary: true } } },
  });
  if (!business) redirect("/onboarding/business");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Business profile</h1>
      <p className="mt-1.5 text-sm text-ink-500">Tell us more about your business.</p>
      <ProfileForm business={business} location={business.locations[0]} />
    </div>
  );
}
