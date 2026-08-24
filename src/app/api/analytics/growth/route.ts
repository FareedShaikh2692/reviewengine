import { requireOrgContext } from "@/lib/api";
import { getReviewGrowthSeries } from "@/lib/dashboard-data";

export async function GET(request: Request) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") ?? "30");
  const series = await getReviewGrowthSeries(auth.ctx.organizationId, days);
  return Response.json({ series });
}
