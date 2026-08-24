"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { href: "/onboarding/business", label: "Business" },
  { href: "/onboarding/profile", label: "Profile" },
  { href: "/onboarding/integrations", label: "Platforms" },
  { href: "/onboarding/customers", label: "Customers" },
];

export function OnboardingStepper() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((s) => pathname?.startsWith(s.href));

  return (
    <ol className="mb-10 flex items-center gap-2">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.href} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done && "bg-brand-gradient text-white",
                active && "border-2 border-brand-mid text-brand-mid",
                !done && !active && "border border-border text-ink-400"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn("hidden text-sm font-medium sm:inline", active ? "text-ink-900" : "text-ink-400")}>
              {step.label}
            </span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
