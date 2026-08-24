import Link from "next/link";
import { Sparkles, Star } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:flex">
        <div className="grid-fade absolute inset-0 opacity-20" />
        <Link href="/" className="relative flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <Sparkles className="h-4 w-4" />
          </span>
          Review Engine
        </Link>
        <div className="relative max-w-md">
          <div className="mb-6 flex gap-1 text-amber-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <p className="text-2xl font-medium leading-snug">
            &ldquo;Our rating went from 4.2 to 4.8 in three months — without a single fake review.&rdquo;
          </p>
          <p className="mt-4 text-sm text-white/70">Owner, multi-location restaurant group</p>
        </div>
        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Review Engine. Genuine feedback, powerfully organized.
        </p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
