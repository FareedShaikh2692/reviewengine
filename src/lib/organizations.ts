import { db } from "@/lib/db";
import { uniqueOrgSlug } from "@/lib/slug";
import { getBusinessDetails, type BusinessSearchResult } from "@/lib/integrations/google-places";

export async function createOrganizationWithBusiness(params: {
  ownerUserId: string;
  place: BusinessSearchResult;
}) {
  const slug = await uniqueOrgSlug(params.place.name);
  const freePlan = await db.plan.findUnique({ where: { key: "FREE" } });

  const organization = await db.organization.create({
    data: {
      name: params.place.name,
      slug,
      industry: params.place.category,
      website: params.place.website ?? undefined,
      phone: params.place.phone ?? undefined,
      members: { create: { userId: params.ownerUserId, role: "OWNER", status: "ACTIVE" } },
      businesses: {
        create: {
          name: params.place.name,
          industry: params.place.category,
          phone: params.place.phone ?? undefined,
          website: params.place.website ?? undefined,
          googlePlaceId: params.place.placeId,
          locations: {
            create: {
              name: "Main location",
              address: params.place.address,
              city: params.place.city,
              lat: params.place.lat ?? undefined,
              lng: params.place.lng ?? undefined,
              isPrimary: true,
            },
          },
        },
      },
    },
    include: { businesses: true },
  });

  if (freePlan) {
    await db.subscription.create({
      data: { organizationId: organization.id, planId: freePlan.id, status: "TRIALING", currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    });
  }

  return organization;
}

export async function createOrganizationFromPlaceId(ownerUserId: string, placeId: string) {
  const place = await getBusinessDetails(placeId);
  if (!place) return null;
  return createOrganizationWithBusiness({ ownerUserId, place });
}

export async function createBlankOrganization(ownerUserId: string, name: string) {
  const slug = await uniqueOrgSlug(name);
  const freePlan = await db.plan.findUnique({ where: { key: "FREE" } });
  const organization = await db.organization.create({
    data: {
      name,
      slug,
      members: { create: { userId: ownerUserId, role: "OWNER", status: "ACTIVE" } },
    },
  });
  if (freePlan) {
    await db.subscription.create({
      data: { organizationId: organization.id, planId: freePlan.id, status: "TRIALING", currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    });
  }
  return organization;
}
