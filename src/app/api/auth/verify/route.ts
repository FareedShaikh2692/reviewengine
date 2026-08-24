import { db } from "@/lib/db";
import { apiError } from "@/lib/api";

export async function POST(request: Request) {
  const { token, email } = (await request.json()) as { token?: string; email?: string };
  if (!token || !email) return apiError(400, "Missing token or email.");

  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record || record.identifier !== email || record.expires < new Date()) {
    return apiError(400, "This verification link is invalid or has expired.");
  }

  await db.user.update({ where: { email }, data: { emailVerified: new Date() } });
  await db.verificationToken.delete({ where: { token } });

  return Response.json({ ok: true });
}
