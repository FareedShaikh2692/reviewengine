import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, parseBody } from "@/lib/api";
import { sendPasswordResetEmail } from "@/lib/auth-emails";

const schema = z.object({ email: z.email() });

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "forgot-password", 5, 60_000);
  if (limited) return limited;

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Always return ok — don't leak whether an email is registered.
  if (user?.passwordHash) {
    await sendPasswordResetEmail(user.id, user.email);
  }

  return Response.json({ ok: true });
}
