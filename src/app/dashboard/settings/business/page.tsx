import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { BusinessSettingsForm } from "@/components/dashboard/settings/business-form";

export default async function BusinessSettingsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const business = await db.business.findFirst({
    where: { organizationId: ctx.organizationId },
    include: { locations: { where: { isPrimary: true } } },
  });
  if (!business) return null;

  return <BusinessSettingsForm business={business} location={business.locations[0]} />;
}
