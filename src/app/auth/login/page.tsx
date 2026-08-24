"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GoogleIcon } from "@/components/auth/google-icon";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(
        res.code === "email-not-verified"
          ? "Please verify your email before logging in — check your inbox for the link."
          : "Invalid email or password."
      );
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-500">Log in to your Review Engine dashboard.</p>

      <Button variant="secondary" className="mt-6 w-full" type="button" onClick={() => signIn("google", { callbackUrl })}>
        <GoogleIcon className="h-4 w-4" /> Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
        <div className="h-px flex-1 bg-border" />
        OR
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-brand-mid hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          <LogIn className="h-4 w-4" /> {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to Review Engine?{" "}
        <Link href="/auth/signup" className="font-medium text-brand-mid hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
