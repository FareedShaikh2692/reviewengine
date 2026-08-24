"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyBody() {
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) return;
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setState("ok");
      })
      .catch((err) => {
        setState("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token, email]);

  if (!token || !email) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft">
          <XCircle className="h-6 w-6 text-danger" />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Verification failed</h1>
        <p className="mt-2 text-sm text-ink-500">This verification link is missing information.</p>
        <Button variant="secondary" className="mt-6 w-full" asChild>
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-mid" />
        <p className="mt-4 text-sm text-ink-500">Verifying your email…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft">
          <XCircle className="h-6 w-6 text-danger" />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Verification failed</h1>
        <p className="mt-2 text-sm text-ink-500">{message}</p>
        <Button variant="secondary" className="mt-6 w-full" asChild>
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft">
        <CheckCircle2 className="h-6 w-6 text-success" />
      </div>
      <h1 className="text-xl font-semibold text-ink-900">Email verified</h1>
      <p className="mt-2 text-sm text-ink-500">Your account is ready. You can now log in.</p>
      <Button className="mt-6 w-full" asChild>
        <Link href="/auth/login">Continue to login</Link>
      </Button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyBody />
    </Suspense>
  );
}
