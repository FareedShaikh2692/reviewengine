"use client";

import { useRouter } from "next/navigation";
import { ConnectorList } from "@/components/integrations/connector-list";

export function ConnectorListWithContinue(props: {
  connected: string[];
  mockFlags: Record<"google" | "email" | "sms" | "billing", boolean>;
}) {
  const router = useRouter();
  return <ConnectorList {...props} onContinue={() => router.push("/onboarding/customers")} />;
}
