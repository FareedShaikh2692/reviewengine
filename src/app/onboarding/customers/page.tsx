import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus, FileSpreadsheet, Database, ArrowRight } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { Card } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default async function OnboardingCustomersPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/business");

  const options = [
    { href: "/dashboard/customers/new", icon: UserPlus, title: "Add Customer", description: "Add your first customer manually." },
    { href: "/dashboard/customers/import", icon: FileSpreadsheet, title: "Import CSV / Excel", description: "Bulk import your customer list." },
    { href: "/dashboard/settings/integrations", icon: Database, title: "Connect CRM", description: "Sync customers automatically." },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Add your first customers</h1>
      <p className="mt-1.5 text-sm text-ink-500">Bring in the people you&apos;d like to request reviews from.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {options.map(({ href, icon: Icon, title, description }) => (
          <Card key={href} className="flex flex-col">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient/10">
              <Icon className="h-5 w-5" style={{ color: "var(--brand-mid)" }} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink-900">{title}</h3>
            <p className="mt-1 flex-1 text-xs text-ink-500">{description}</p>
            <Button variant="secondary" size="sm" className="mt-4" asChild>
              <Link href={href}>{title}</Link>
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
