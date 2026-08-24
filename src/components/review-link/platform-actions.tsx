"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewCompletedButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");

  async function markDone() {
    setState("saving");
    await fetch(`/api/r/${token}/complete`, { method: "POST" });
    setState("done");
  }

  if (state === "done") {
    return (
      <p className="flex items-center justify-center gap-2 text-sm font-medium text-success">
        <CheckCircle2 className="h-4 w-4" /> Thank you — your review means a lot to us!
      </p>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={markDone} disabled={state === "saving"}>
      {state === "saving" ? "Saving…" : "I already left my review"}
    </Button>
  );
}

export function UnsubscribeLink({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");

  async function unsubscribe() {
    if (!confirm("You will no longer receive review requests from this business. Continue?")) return;
    setState("saving");
    await fetch(`/api/r/${token}/unsubscribe`, { method: "POST" });
    setState("done");
  }

  if (state === "done") return <p className="text-xs text-ink-400">You&apos;ve been unsubscribed.</p>;

  return (
    <button onClick={unsubscribe} disabled={state === "saving"} className="text-xs text-ink-400 underline hover:text-ink-600">
      Don&apos;t want future requests? Unsubscribe
    </button>
  );
}
