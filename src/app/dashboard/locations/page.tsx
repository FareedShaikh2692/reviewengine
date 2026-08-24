import { MapPin } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/states";
import { LocationsManager } from "@/components/dashboard/locations/locations-manager";

export default async function LocationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const business = await db.business.findFirst({
    where: { organizationId: ctx.organizationId },
    include: { locations: { orderBy: { isPrimary: "desc" } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Locations</h1>
        <p className="mt-1 text-sm text-ink-500">Manage every location for {business?.name ?? "your business"}.</p>
      </div>

      {!business ? (
        <EmptyState icon={MapPin} title="No business found" />
      ) : (
        <LocationsManager locations={business.locations} />
      )}
    </div>
  );
}
