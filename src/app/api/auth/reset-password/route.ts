import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { apiError, parseBody } from "@/lib/api";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
});

export async function POST(request: Request) {
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const record = await db.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.usedAt || record.expires < new Date()) {
    return apiError(400, "This reset link is invalid or has expired.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  return Response.json({ ok: true });
}
