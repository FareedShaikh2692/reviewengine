import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { apiError } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return apiError(400, "Missing query.");

  const [businesses, users, customers, campaigns] = await Promise.all([
    db.business.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 10, include: { organization: true } }),
    db.user.findMany({ where: { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] }, take: 10 }),
    db.customer.findMany({ where: { OR: [{ email: { contains: q, mode: "insensitive" } }, { firstName: { contains: q, mode: "insensitive" } }] }, take: 10 }),
    db.campaign.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 10 }),
  ]);

  return Response.json({ businesses, users, customers, campaigns });
}
