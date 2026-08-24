import { signOut } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

export function AdminTopbar({ email, role }: { email: string; role: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <Badge variant="danger">Super Admin Portal</Badge>
      <div className="flex items-center gap-3 text-sm text-ink-500">
        <span>{email}</span>
        <Badge variant="outline">{role}</Badge>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="flex items-center gap-1 text-ink-500 hover:text-ink-900">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
