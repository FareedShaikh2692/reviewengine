import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImportWizard } from "@/components/dashboard/customers/import-wizard";

export default function ImportCustomersPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/customers" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">Import customers</h1>
      <p className="mt-1.5 text-sm text-ink-500">Upload a CSV or Excel-exported CSV file with your customer list.</p>
      <ImportWizard />
    </div>
  );
}
