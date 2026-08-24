import { z } from "zod";
import { getSessionUser } from "@/lib/tenant";
import { apiError, parseBody } from "@/lib/api";
import { createOrganizationFromPlaceId, createBlankOrganization } from "@/lib/organizations";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({
  placeId: z.string().optional(),
  manualName: z.string().min(2).max(120).optional(),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return apiError(401, "Not authenticated.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const { placeId, manualName } = parsed.data;
  if (!placeId && !manualName) return apiError(400, "Provide a placeId or a business name.");

  const organization = placeId
    ? await createOrganizationFromPlaceId(user.id, placeId)
    : await createBlankOrganization(user.id, manualName!);

  if (!organization) return apiError(404, "We couldn't find that business.");

  await logAudit({
    organizationId: organization.id,
    userId: user.id,
    action: "BUSINESS_CONNECTED",
    resourceType: "Organization",
    resourceId: organization.id,
    ipAddress: ipFromRequest(request),
  });

  return Response.json({ ok: true, organizationId: organization.id, slug: organization.slug });
}
