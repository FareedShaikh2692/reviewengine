import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { apiError, checkRateLimit, parseBody } from "@/lib/api";
import { sendVerificationEmail } from "@/lib/auth-emails";
import { createOrganizationFromPlaceId } from "@/lib/organizations";
import { logAudit, ipFromRequest } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/, "Must contain a letter")
    .regex(/[0-9]/, "Must contain a number"),
  placeId: z.string().optional(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "signup", 10, 60_000);
  if (limited) return limited;

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const { name, email, password, placeId } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing?.passwordHash || existing?.emailVerified) {
    return apiError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // A placeholder user (no passwordHash) can exist if they were invited to a team before signing up — claim it instead of erroring.
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { name, passwordHash } })
    : await db.user.create({ data: { name, email: email.toLowerCase(), passwordHash } });

  if (placeId) {
    try {
      await createOrganizationFromPlaceId(user.id, placeId);
    } catch (err) {
      console.error("Failed to create organization from placeId during signup", err);
    }
  }

  await sendVerificationEmail(user.email);
  await logAudit({
    userId: user.id,
    action: "USER_SIGNUP",
    resourceType: "User",
    resourceId: user.id,
    ipAddress: ipFromRequest(request),
  });

  return Response.json({ ok: true, email: user.email });
}
