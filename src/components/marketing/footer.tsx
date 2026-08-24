import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-ink-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              Review Engine
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              Turn great customer experiences into powerful reviews.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><a href="#features" className="hover:text-ink-900">Features</a></li>
              <li><a href="#pricing" className="hover:text-ink-900">Pricing</a></li>
              <li><Link href="/search" className="hover:text-ink-900">Find my business</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link href="/legal/privacy" className="hover:text-ink-900">Privacy policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-ink-900">Terms of service</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Account</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link href="/auth/login" className="hover:text-ink-900">Log in</Link></li>
              <li><Link href="/auth/signup" className="hover:text-ink-900">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Review Engine. All rights reserved.</p>
          <p>Built to collect genuine, authentic customer feedback — never fake reviews.</p>
        </div>
      </div>
    </footer>
  );
}
