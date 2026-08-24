import "server-only";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { OrgRole } from "@/generated/prisma/enums";
import { roleAtLeast } from "@/lib/rbac";

export const ACTIVE_ORG_COOKIE = "activeOrgId";

export type OrgContext = {
  userId: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrgRole;
};

/** Current authenticated user's id/email, or null. Never throws. */
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  return { id: session.user.id, email: session.user.email, name: session.user.name ?? null };
}

/**
 * Resolves the caller's active organization membership.
 * Tenant isolation boundary: every tenant-scoped query must originate from this.
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const preferredOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  // Invited members are activated the moment they authenticate and reach the dashboard.
  await db.organizationMember.updateMany({ where: { userId: user.id, status: "INVITED" }, data: { status: "ACTIVE" } });

  const memberships = await db.organizationMember.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) return null;

  const active =
    memberships.find((m) => m.organizationId === preferredOrgId) ?? memberships[0];

  if (active.organization.status !== "ACTIVE") return null;

  return {
    userId: user.id,
    userEmail: user.email,
    organizationId: active.organizationId,
    organizationName: active.organization.name,
    organizationSlug: active.organization.slug,
    role: active.role,
  };
}

export async function listUserOrganizations(userId: string) {
  return db.organizationMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
}

export function assertRole(ctx: OrgContext, minimum: OrgRole): boolean {
  return roleAtLeast(ctx.role, minimum);
}

export async function getAdminUser() {
  const user = await getSessionUser();
  if (!user) return null;
  const admin = await db.adminUser.findUnique({ where: { userId: user.id } });
  if (!admin) return null;
  return { ...admin, userId: user.id, userEmail: user.email };
}
