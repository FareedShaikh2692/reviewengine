import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/tenant";
import { apiError, parseBody } from "@/lib/api";
import { ACTIVE_ORG_COOKIE } from "@/lib/tenant";

const schema = z.object({ organizationId: z.string() });

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return apiError(401, "Not authenticated.");

  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const membership = await db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: parsed.data.organizationId, userId: user.id } },
  });
  if (!membership) return apiError(403, "You are not a member of this organization.");

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ACTIVE_ORG_COOKIE}=${parsed.data.organizationId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`
  );
  return response;
}
