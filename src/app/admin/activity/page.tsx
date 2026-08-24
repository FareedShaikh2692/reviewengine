import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default async function AdminActivityPage() {
  const logs = await db.auditLog.findMany({
    include: { organization: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Global activity</h1>
        <p className="mt-1 text-sm text-ink-500">Every signup, integration, import, and campaign action across the platform.</p>
      </div>

      <div className="relative space-y-0 border-l border-border pl-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pb-6">
            <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-brand-gradient" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-ink-400">
                {log.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <Badge variant={log.result === "SUCCESS" ? "success" : "danger"}>{log.result}</Badge>
              {log.organization && <Badge variant="outline">{log.organization.name}</Badge>}
            </div>
            <p className="mt-1 text-sm text-ink-900">{log.action.replace(/_/g, " ")}</p>
            <p className="text-xs text-ink-500">{log.user?.email ?? "system"} · {log.resourceType}</p>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-ink-500">No activity recorded yet.</p>}
      </div>
    </div>
  );
}
