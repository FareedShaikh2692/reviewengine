import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { CustomerEditForm } from "@/components/dashboard/customers/customer-edit-form";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) return null;
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      reviewRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer || customer.organizationId !== ctx.organizationId) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/customers" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          {customer.firstName} {customer.lastName}
        </h1>
        <div className="flex gap-2">
          {customer.tags.map((t) => (
            <span key={t.tag.id} className="rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: t.tag.color }}>
              {t.tag.name}
            </span>
          ))}
        </div>
      </div>

      <CustomerEditForm customer={customer} />

      <Card>
        <h2 className="text-base font-semibold text-ink-900">Review request history</h2>
        <div className="mt-4 space-y-2">
          {customer.reviewRequests.length === 0 && <p className="text-sm text-ink-500">No review requests sent yet.</p>}
          {customer.reviewRequests.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2.5 text-sm">
              <div>
                <span className="font-medium text-ink-900">{r.channel}</span>
                <span className="ml-2 text-ink-400">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "danger" : "info"}>
                {r.status.replace(/_/g, " ")}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
