import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass-panel rounded-2xl p-6", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-surface p-6 shadow-premium", className)}
      {...props}
    />
  );
}
