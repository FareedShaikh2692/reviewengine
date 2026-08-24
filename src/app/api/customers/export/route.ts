import { db } from "@/lib/db";
import { requireOrgContext } from "@/lib/api";
import { logAudit, ipFromRequest } from "@/lib/audit";

function csvEscape(value: string | null | undefined): string {
  const v = value ?? "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET(request: Request) {
  const auth = await requireOrgContext();
  if ("error" in auth) return auth.error;

  const customers = await db.customer.findMany({
    where: { organizationId: auth.ctx.organizationId },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "asc" },
  });

  const header = ["First Name", "Last Name", "Email", "Phone", "Company", "Service/Product", "Status", "Consent", "Tags", "Created Date"];
  const rows = customers.map((c) =>
    [
      c.firstName,
      c.lastName ?? "",
      c.email ?? "",
      c.phone ?? "",
      c.company ?? "",
      c.serviceProduct ?? "",
      c.status,
      c.consentStatus,
      c.tags.map((t) => t.tag.name).join("; "),
      c.createdAt.toISOString().slice(0, 10),
    ]
      .map(csvEscape)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  await logAudit({
    organizationId: auth.ctx.organizationId,
    userId: auth.ctx.userId,
    action: "CUSTOMERS_EXPORTED",
    resourceType: "Customer",
    ipAddress: ipFromRequest(request),
    metadata: { count: customers.length },
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
