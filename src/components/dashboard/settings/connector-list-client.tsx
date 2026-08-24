"use client";

import { ConnectorList } from "@/components/integrations/connector-list";

export function ConnectorListClient(props: {
  connected: string[];
  mockFlags: Record<"google" | "email" | "sms" | "billing", boolean>;
}) {
  return <ConnectorList {...props} />;
}
