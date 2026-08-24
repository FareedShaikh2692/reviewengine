import { searchBusinesses } from "@/lib/integrations/google-places";
import { checkRateLimit, apiError } from "@/lib/api";

export async function GET(request: Request) {
  const limited = checkRateLimit(request, "public-search", 30, 60_000);
  if (limited) return limited;

  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  if (q === null) return apiError(400, "Missing search query.");

  try {
    const results = await searchBusinesses(q.trim());
    return Response.json({ results });
  } catch (err) {
    console.error("Business search failed", err);
    return apiError(502, "Business search is temporarily unavailable.");
  }
}
