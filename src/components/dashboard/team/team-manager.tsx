"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

type Member = { id: string; userId: string; role: string; status: string; name: string | null; email: string };

const ROLES = ["ADMIN", "MANAGER", "STAFF", "VIEWER"];
const canManage = (role: string) => role === "OWNER" || role === "ADMIN";

export function TeamManager({ members, currentRole, currentUserId }: { members: Member[]; currentRole: string; currentUserId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STAFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setEmail("");
    router.refresh();
  }

  async function changeRole(id: string, newRole: string) {
    await fetch(`/api/team/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canManage(currentRole) && (
        <Card>
          <h2 className="text-base font-semibold text-ink-900">Invite a teammate</h2>
          <form onSubmit={invite} className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)} className="w-36">
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={loading}>
              <UserPlus className="h-4 w-4" /> {loading ? "Inviting…" : "Invite"}
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </Card>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-premium">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                      {initials(m.name || m.email)}
                    </span>
                    <div>
                      <p className="font-medium text-ink-900">{m.name || m.email}</p>
                      <p className="text-xs text-ink-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {canManage(currentRole) && m.role !== "OWNER" ? (
                    <Select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} className="h-8 w-32 text-xs">
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </Select>
                  ) : (
                    <Badge variant="brand">{m.role}</Badge>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={m.status === "ACTIVE" ? "success" : "warning"}>{m.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {canManage(currentRole) && m.role !== "OWNER" && m.userId !== currentUserId && (
                    <button onClick={() => remove(m.id)} className="text-danger hover:opacity-70">
                      <Trash2 className="ml-auto h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
