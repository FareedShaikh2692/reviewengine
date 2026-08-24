"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/settings/profile", label: "Profile" },
  { href: "/dashboard/settings/business", label: "Business" },
  { href: "/dashboard/settings/integrations", label: "Integrations" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
  { href: "/dashboard/settings/billing", label: "Billing" },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition",
              active ? "border-brand-mid text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
