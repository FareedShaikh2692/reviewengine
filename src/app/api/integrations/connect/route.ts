import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";
import { isMock } from "@/lib/env";
import { logAudit, ipFromRequest } from "@/lib/audit";
import { notifyOrg } from "@/lib/notify";
import { decryptSecret } from "@/lib/crypto";

const schema = z.object({ provider: z.enum(["GOOGLE", "EMAIL", "SMS", "WHATSAPP", "STRIPE", "CRM"]) });

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_INTEGRATIONS");
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found.");

  // For Google, reuse the OAuth tokens captured at sign-in (see auth.ts) instead of a second
  // consent flow. Falls back to a mock/manual connection if the user signed in with a password
  // or Google OAuth isn't configured.
  let encryptedAccessToken: string | undefined;
  let encryptedRefreshToken: string | undefined;
  let tokenExpiresAt: Date | undefined;
  let usedRealOAuth = false;

  if (parsed.data.provider === "GOOGLE" && !isMock.googleOAuth) {
    const user = await db.user.findUnique({ where: { id: auth.ctx.userId } });
    if (user?.googleAccessTokenEnc) {
      // Sanity-check the stored ciphertext actually decrypts before trusting it.
      try {
        decryptSecret(user.googleAccessTokenEnc);
        encryptedAccessToken = user.googleAccessTokenEnc;
        encryptedRefreshToken = user.googleRefreshTokenEnc ?? undefined;
        tokenExpiresAt = user.googleTokenExpiresAt ?? undefined;
        usedRealOAuth = true;
      } catch {
        // Corrupt/unreadable token — fall through to mock connection below.
      }
    }
  }

  await db.businessIntegration.upsert({
    where: { businessId_provider: { businessId: business.id, provider: parsed.data.provider } },
    create: {
      organizationId: auth.ctx.organizationId,
      businessId: business.id,
      provider: parsed.data.provider,
      status: "CONNECTED",
      connectedAt: new Date(),
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
      metadata: { mock: !usedRealOAuth },
    },
    update: {
      status: "CONNECTED",
      connectedAt: new Date(),
      disconnectedAt: null,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
      metadata: { mock: !usedRealOAuth },
    },
  });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "INTEGRATION_CONNECTED",
    resourceType: "BusinessIntegration",
    resourceId: parsed.data.provider,
    ipAddress: ipFromRequest(request),
    metadata: { usedRealOAuth },
  });

  return Response.json({ ok: true, usedRealOAuth });
}

export async function DELETE(request: Request) {
  const auth = await requirePermission("MANAGE_INTEGRATIONS");
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const business = await db.business.findFirst({ where: { organizationId: auth.ctx.organizationId } });
  if (!business) return apiError(404, "No business found.");

  await db.businessIntegration.updateMany({
    where: { businessId: business.id, provider: parsed.data.provider },
    data: { status: "DISCONNECTED", disconnectedAt: new Date(), encryptedAccessToken: null, encryptedRefreshToken: null },
  });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "INTEGRATION_DISCONNECTED",
    resourceType: "BusinessIntegration",
    resourceId: parsed.data.provider,
    ipAddress: ipFromRequest(request),
  });

  await notifyOrg({
    organizationId: auth.ctx.organizationId,
    type: "INTEGRATION_DISCONNECTED",
    title: "Integration disconnected",
    body: `${parsed.data.provider} was disconnected from your business.`,
    metadata: { provider: parsed.data.provider },
  });

  return Response.json({ ok: true });
}
