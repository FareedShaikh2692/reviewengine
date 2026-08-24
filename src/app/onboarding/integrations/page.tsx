import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { isMock } from "@/lib/env";
import { ConnectorListWithContinue } from "@/components/onboarding/connector-continue";

export default async function OnboardingIntegrationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/business");

  const business = await db.business.findFirst({ where: { organizationId: ctx.organizationId } });
  const integrations = business
    ? await db.businessIntegration.findMany({ where: { businessId: business.id, status: "CONNECTED" } })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Connect review platforms</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Connect the platforms you use. We never ask for your Google password — everything goes through official
        OAuth.
      </p>
      <div className="mt-6">
        <ConnectorListWithContinue
          connected={integrations.map((i) => i.provider)}
          mockFlags={{ google: isMock.googleOAuth, email: isMock.email, sms: isMock.sms, billing: isMock.billing }}
        />
      </div>
    </div>
  );
}
