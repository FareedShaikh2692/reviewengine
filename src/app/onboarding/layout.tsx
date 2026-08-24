import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/tenant";
import { OnboardingStepper } from "@/components/onboarding/stepper";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?callbackUrl=/onboarding/business");

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            Review Engine
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <OnboardingStepper />
        {children}
      </div>
    </div>
  );
}
