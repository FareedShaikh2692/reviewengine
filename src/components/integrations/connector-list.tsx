"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plug, Mail, MessageSquare, MessagesSquare, CreditCard, Database } from "lucide-react";
import { Card } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PROVIDERS = [
  { key: "GOOGLE", label: "Google", description: "Sync your Google Business Profile & reviews.", icon: Plug, mockFlag: "google" as const },
  { key: "EMAIL", label: "Email provider", description: "Send review requests by email.", icon: Mail, mockFlag: "email" as const },
  { key: "SMS", label: "SMS provider", description: "Send review requests by text message.", icon: MessageSquare, mockFlag: "sms" as const },
  { key: "WHATSAPP", label: "WhatsApp", description: "Send review requests over WhatsApp.", icon: MessagesSquare, mockFlag: "sms" as const },
  { key: "STRIPE", label: "Billing (Stripe)", description: "Manage your subscription and invoices.", icon: CreditCard, mockFlag: "billing" as const },
  { key: "CRM", label: "CRM", description: "Sync customers from your CRM.", icon: Database, mockFlag: "email" as const },
] as const;

export function ConnectorList({
  connected,
  mockFlags,
  onContinue,
}: {
  connected: string[];
  mockFlags: Record<"google" | "email" | "sms" | "billing", boolean>;
  onContinue?: () => void;
}) {
  const router = useRouter();
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(connected.map((c) => [c, true]))
  );
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(provider: string, currentlyConnected: boolean) {
    setLoading(provider);
    const res = await fetch("/api/integrations/connect", {
      method: currentlyConnected ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    setLoading(null);
    if (res.ok) {
      setState((s) => ({ ...s, [provider]: !currentlyConnected }));
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ key, label, description, icon: Icon, mockFlag }) => {
        const isConnected = Boolean(state[key]);
        return (
          <Card key={key} className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient/10">
                <Icon className="h-5 w-5" style={{ color: "var(--brand-mid)" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">{label}</p>
                  {mockFlags[mockFlag] && <Badge variant="warning">Mock mode</Badge>}
                  {isConnected && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-ink-500">{description}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant={isConnected ? "secondary" : "primary"}
              disabled={loading === key}
              onClick={() => toggle(key, isConnected)}
            >
              {loading === key ? "…" : isConnected ? "Disconnect" : "Connect"}
            </Button>
          </Card>
        );
      })}
      {onContinue && (
        <div className="flex justify-end pt-4">
          <Button size="lg" onClick={onContinue}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
