import "server-only";
import { getAdminUser } from "@/lib/tenant";
import { apiError } from "@/lib/api";
import type { NextResponse } from "next/server";

export async function requireAdmin(): Promise<
  { admin: NonNullable<Awaited<ReturnType<typeof getAdminUser>>> } | { error: NextResponse }
> {
  const admin = await getAdminUser();
  if (!admin) return { error: apiError(403, "Super admin access required.") };
  return { admin };
}
