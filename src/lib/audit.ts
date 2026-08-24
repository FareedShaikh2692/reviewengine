import "server-only";
import { db } from "@/lib/db";
import type { AuditResult } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export async function logAudit(params: {
  organizationId?: string;
  userId?: string;
  adminUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string | null;
  result?: AuditResult;
  metadata?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      adminUserId: params.adminUserId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      ipAddress: params.ipAddress ?? undefined,
      result: params.result ?? "SUCCESS",
      metadata: (params.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

export function ipFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}
