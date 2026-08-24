import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/tenant";
import { apiError, parseBody } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).optional(),
  notificationPreferences: z
    .object({
      email: z.boolean(),
      newReview: z.boolean(),
      campaignActivity: z.boolean(),
      productUpdates: z.boolean(),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return apiError(401, "Not authenticated.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  await db.user.update({ where: { id: user.id }, data: parsed.data });
  return Response.json({ ok: true });
}
