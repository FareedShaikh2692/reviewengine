import Link from "next/link";
import { UserPlus, Upload, Download } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { CustomersTable } from "@/components/dashboard/customers/customers-table";
import { CustomerStatusFilter } from "@/components/dashboard/customers/status-filter";

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) return null;
  const { q, status, page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1");

  const business = await db.business.findFirst({ where: { organizationId: ctx.organizationId } });

  const where = {
    organizationId: ctx.organizationId,
    ...(business ? { businessId: business.id } : {}),
    ...(status ? { status: status as never } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.customer.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Customers</h1>
          <p className="mt-1 text-sm text-ink-500">{total.toLocaleString()} total customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <a href="/api/customers/export" download>
              <Download className="h-4 w-4" /> Export
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/customers/import">
              <Upload className="h-4 w-4" /> Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <UserPlus className="h-4 w-4" /> Add Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-[240px]">
          <Input name="q" defaultValue={q} placeholder="Search by name or email…" />
        </form>
        <CustomerStatusFilter current={status} />
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add your first customer or import a list to start sending review requests."
          action={
            <Button asChild>
              <Link href="/dashboard/customers/new">
                <UserPlus className="h-4 w-4" /> Add Customer
              </Link>
            </Button>
          }
        />
      ) : (
        <CustomersTable customers={customers} total={total} page={page} pageSize={PAGE_SIZE} />
      )}
    </div>
  );
}
