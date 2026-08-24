import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, apiError, parseBody } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";
import { sendEmail } from "@/lib/integrations/email";
import { env } from "@/lib/env";

const schema = z.object({
  email: z.email(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "VIEWER"]),
});

export async function POST(request: Request) {
  const auth = await requirePermission("MANAGE_TEAM");
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const email = parsed.data.email.toLowerCase();

  const user = await db.user.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  const existingMembership = await db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: auth.ctx.organizationId, userId: user.id } },
  });
  if (existingMembership) return apiError(409, "This person is already a member.");

  await db.organizationMember.create({
    data: { organizationId: auth.ctx.organizationId, userId: user.id, role: parsed.data.role, status: "INVITED", invitedEmail: email },
  });

  await sendEmail({
    to: email,
    subject: `You've been invited to join ${auth.ctx.organizationName} on Review Engine`,
    html: `<p>You've been invited to join <strong>${auth.ctx.organizationName}</strong> as ${parsed.data.role}. <a href="${env.APP_URL}/auth/signup">Create your account</a> with this email to accept.</p>`,
    text: `You've been invited to join ${auth.ctx.organizationName} as ${parsed.data.role}. Create your account at ${env.APP_URL}/auth/signup with this email to accept.`,
  });

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "TEAM_MEMBER_INVITED",
    resourceType: "OrganizationMember",
    resourceId: user.id,
    ipAddress: ipFromRequest(request),
    metadata: { email, role: parsed.data.role },
  });

  return Response.json({ ok: true });
}
