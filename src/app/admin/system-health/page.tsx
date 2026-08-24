import { db } from "@/lib/db";
import { isMock, env } from "@/lib/env";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type HealthStatus = "healthy" | "warning" | "error";

async function checkDb(): Promise<HealthStatus> {
  try {
    await db.$queryRaw`SELECT 1`;
    return "healthy";
  } catch {
    return "error";
  }
}

const STATUS_META: Record<HealthStatus, { label: string; icon: typeof CheckCircle2; variant: "success" | "warning" | "danger" }> = {
  healthy: { label: "Healthy", icon: CheckCircle2, variant: "success" },
  warning: { label: "Warning", icon: AlertTriangle, variant: "warning" },
  error: { label: "Error", icon: XCircle, variant: "danger" },
};

export default async function SystemHealthPage() {
  const dbStatus = await checkDb();

  const services: { name: string; status: HealthStatus; detail: string }[] = [
    { name: "API", status: "healthy", detail: "Request handlers responding normally." },
    { name: "Database", status: dbStatus, detail: "PostgreSQL connection via Prisma." },
    {
      name: "Background jobs (Cron)",
      status: env.CRON_SECRET ? "healthy" : "warning",
      detail: env.CRON_SECRET
        ? "CRON_SECRET configured — /api/cron/tick is protected and ready for Vercel Cron."
        : "CRON_SECRET not set — /api/cron/tick is unprotected. Set it before deploying, or run `npm run worker` if self-hosting.",
    },
    { name: "Email provider", status: isMock.email ? "warning" : "healthy", detail: isMock.email ? "Running in mock/simulated mode." : "Resend configured." },
    { name: "SMS / WhatsApp", status: isMock.sms ? "warning" : "healthy", detail: isMock.sms ? "Running in mock/simulated mode." : "Twilio configured." },
    { name: "Google integration", status: isMock.google ? "warning" : "healthy", detail: isMock.google ? "Places search using seeded mock data." : "Google Places API configured." },
    { name: "AI service", status: isMock.ai ? "warning" : "healthy", detail: isMock.ai ? "Using heuristic sentiment fallback." : "Anthropic API configured." },
    { name: "Billing (Stripe)", status: isMock.billing ? "warning" : "healthy", detail: isMock.billing ? "Dev billing mode — no real charges." : "Stripe configured." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">System health</h1>
        <p className="mt-1 text-sm text-ink-500">Live status of every platform dependency.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const meta = STATUS_META[s.status];
          const Icon = meta.icon;
          return (
            <Card key={s.name} className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.status === "healthy" ? "text-success" : s.status === "warning" ? "text-warning" : "text-danger"}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-500">{s.detail}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
