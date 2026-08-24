"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Check your email</h1>
        <p className="mt-2 text-sm text-ink-500">
          If an account exists for <span className="font-medium text-ink-700">{email}</span>, we&apos;ve sent a
          password reset link.
        </p>
        <Button variant="secondary" className="mt-6 w-full" asChild>
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Forgot password</h1>
      <p className="mt-1.5 text-sm text-ink-500">We&apos;ll email you a link to reset it.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          <Mail className="h-4 w-4" /> {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        <Link href="/auth/login" className="font-medium text-brand-mid hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
