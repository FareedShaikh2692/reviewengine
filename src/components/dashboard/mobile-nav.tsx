"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { DASHBOARD_NAV } from "./nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="left-0 right-auto max-w-72 border-l-0 border-r">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            Review Engine
          </DrawerTitle>
        </DrawerHeader>
        <nav className="-mx-2 flex-1 space-y-0.5 overflow-y-auto">
          {DASHBOARD_NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand-gradient text-white shadow-premium" : "text-ink-500 hover:bg-surface-muted hover:text-ink-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </DrawerContent>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-[18px] w-[18px]" />
      </Button>
    </Drawer>
  );
}
