import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignBuilder } from "@/components/dashboard/campaigns/campaign-builder";

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/campaigns" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold tracking-tight text-ink-900">New campaign</h1>
      <CampaignBuilder />
    </div>
  );
}
