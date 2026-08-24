import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgContext, type OrgContext } from "@/lib/tenant";
import { assertRole } from "@/lib/tenant";
import type { OrgRole } from "@/generated/prisma/enums";
import { rateLimit } from "@/lib/rate-limit";
import { ipFromRequest } from "@/lib/audit";
import { PERMISSIONS, can, type Permission } from "@/lib/rbac";

export function apiError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/** Resolves org context for an API route, or an error response to return immediately. */
export async function requireOrgContext(minRole?: OrgRole): Promise<
  { ctx: OrgContext } | { error: NextResponse }
> {
  const ctx = await getOrgContext();
  if (!ctx) {
    return { error: apiError(401, "Not authenticated or no active organization.") };
  }
  if (minRole && !assertRole(ctx, minRole)) {
    return { error: apiError(403, `Requires ${minRole} role or higher.`) };
  }
  return { ctx };
}

/** Resolves org context and checks a named permission (see lib/rbac.ts) rather than a raw role. */
export async function requirePermission(permission: Permission): Promise<
  { ctx: OrgContext } | { error: NextResponse }
> {
  const ctx = await getOrgContext();
  if (!ctx) {
    return { error: apiError(401, "Not authenticated or no active organization.") };
  }
  if (!can(ctx.role, permission)) {
    return { error: apiError(403, `Requires the "${permission}" permission (${PERMISSIONS[permission]} role or higher).`) };
  }
  return { ctx };
}

export function checkRateLimit(request: Request, bucket: string, limit = 60, windowMs = 60_000) {
  const ip = ipFromRequest(request) ?? "unknown";
  const { allowed } = rateLimit(`${bucket}:${ip}`, limit, windowMs);
  if (!allowed) {
    return apiError(429, "Too many requests. Please slow down.");
  }
  return null;
}

export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<{ data: T } | { error: NextResponse }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { error: apiError(400, "Invalid JSON body.") };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    return { error: apiError(400, "Validation failed.", result.error.flatten()) };
  }
  return { data: result.data };
}
