"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GoogleIcon } from "@/components/auth/google-icon";

function SignupForm() {
  const params = useSearchParams();
  const placeId = params.get("place") ?? undefined;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, placeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Check your email</h1>
        <p className="mt-2 text-sm text-ink-500">
          We sent a verification link to <span className="font-medium text-ink-700">{email}</span>. Click it to
          activate your account.
        </p>
        <Button variant="secondary" className="mt-6 w-full" asChild>
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Create your free account</h1>
      <p className="mt-1.5 text-sm text-ink-500">Start turning happy customers into reviews.</p>

      <Button
        variant="secondary"
        className="mt-6 w-full"
        type="button"
        onClick={() => signIn("google", { callbackUrl: placeId ? `/onboarding/business?place=${placeId}` : "/dashboard" })}
      >
        <GoogleIcon className="h-4 w-4" /> Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
        <div className="h-px flex-1 bg-border" />
        OR
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Amina Khan" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          <Mail className="h-4 w-4" /> {loading ? "Creating account…" : "Continue with Email"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-brand-mid hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
