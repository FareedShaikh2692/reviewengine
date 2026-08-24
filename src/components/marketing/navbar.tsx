import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Features" },
  { href: "#industries", label: "Industries" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-premium">
            <Sparkles className="h-4 w-4" />
          </span>
          Review Engine
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-500 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-ink-900">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/search">Find My Business</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
