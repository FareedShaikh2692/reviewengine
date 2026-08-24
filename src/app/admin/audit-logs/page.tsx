import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default async function AdminAuditLogsPage() {
  const logs = await db.auditLog.findMany({
    include: { organization: true, user: true, adminUser: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Audit logs</h1>
        <p className="mt-1 text-sm text-ink-500">Every sensitive action, tenant and admin, fully attributed.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-premium">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Resource</th>
                <th className="px-5 py-3">Organization</th>
                <th className="px-5 py-3">IP</th>
                <th className="px-5 py-3">Result</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-ink-700">{log.adminUser?.user.email ?? log.user?.email ?? "system"}</td>
                  <td className="px-5 py-3 text-ink-900">{log.action.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-ink-500">{log.resourceType}</td>
                  <td className="px-5 py-3 text-ink-500">{log.organization?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-500">{log.ipAddress ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={log.result === "SUCCESS" ? "success" : "danger"}>{log.result}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{log.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
