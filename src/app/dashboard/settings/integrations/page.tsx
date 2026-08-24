import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { isMock } from "@/lib/env";
import { ConnectorListClient } from "@/components/dashboard/settings/connector-list-client";

export default async function IntegrationsSettingsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const business = await db.business.findFirst({ where: { organizationId: ctx.organizationId } });
  const integrations = business
    ? await db.businessIntegration.findMany({ where: { businessId: business.id, status: "CONNECTED" } })
    : [];

  return (
    <div className="max-w-2xl">
      <ConnectorListClient
        connected={integrations.map((i) => i.provider)}
        mockFlags={{ google: isMock.googleOAuth, email: isMock.email, sms: isMock.sms, billing: isMock.billing }}
      />
    </div>
  );
}
