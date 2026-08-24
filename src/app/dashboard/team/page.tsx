import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { TeamManager } from "@/components/dashboard/team/team-manager";

export default async function TeamPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const members = await db.organizationMember.findMany({
    where: { organizationId: ctx.organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Team</h1>
        <p className="mt-1 text-sm text-ink-500">Invite teammates and manage their access.</p>
      </div>

      <TeamManager
        members={members.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          status: m.status,
          name: m.user.name,
          email: m.user.email,
        }))}
        currentRole={ctx.role}
        currentUserId={ctx.userId}
      />
    </div>
  );
}
