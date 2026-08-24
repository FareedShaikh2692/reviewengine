import { OrgRole } from "@/generated/prisma/enums";

const ROLE_RANK: Record<OrgRole, number> = {
  VIEWER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function roleAtLeast(role: OrgRole, minimum: OrgRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export const PERMISSIONS = {
  MANAGE_BILLING: "OWNER",
  MANAGE_TEAM: "ADMIN",
  MANAGE_SETTINGS: "ADMIN",
  MANAGE_INTEGRATIONS: "ADMIN",
  MANAGE_LOCATIONS: "ADMIN",
  MANAGE_CAMPAIGNS: "MANAGER",
  MANAGE_AUTOMATIONS: "MANAGER",
  MANAGE_CUSTOMERS: "STAFF",
  SEND_REQUESTS: "STAFF",
  RUN_AI_ANALYSIS: "STAFF",
  VIEW_ANALYTICS: "VIEWER",
  VIEW_REVIEWS: "VIEWER",
} as const satisfies Record<string, OrgRole>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: OrgRole, permission: Permission): boolean {
  return roleAtLeast(role, PERMISSIONS[permission]);
}
