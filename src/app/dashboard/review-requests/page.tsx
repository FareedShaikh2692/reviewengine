import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/states";
import { Send } from "lucide-react";
import { RequestsTable } from "@/components/dashboard/review-requests/requests-table";
import { env } from "@/lib/env";

export default async function ReviewRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; channel?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) return null;
  const { status, channel } = await searchParams;

  const requests = await db.reviewRequest.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(status ? { status: status as never } : {}),
      ...(channel ? { channel: channel as never } : {}),
    },
    include: { customer: true, campaign: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Review requests</h1>
        <p className="mt-1 text-sm text-ink-500">Track every request from send to completion — click a row to see the message.</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={Send} title="No review requests yet" description="Send a request from the Customers page to see tracking here." />
      ) : (
        <RequestsTable
          appUrl={env.APP_URL}
          requests={requests.map((r) => ({
            id: r.id,
            channel: r.channel,
            status: r.status,
            message: r.message,
            trackingToken: r.trackingToken,
            sentAt: r.sentAt?.toISOString() ?? null,
            completedAt: r.completedAt?.toISOString() ?? null,
            customerName: `${r.customer.firstName} ${r.customer.lastName ?? ""}`.trim(),
            campaignName: r.campaign?.name ?? null,
          }))}
        />
      )}
    </div>
  );
}
