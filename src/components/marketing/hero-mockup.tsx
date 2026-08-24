"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp, Send, CheckCircle2, Percent } from "lucide-react";

export function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-16 -z-10 grid-fade" />
      <div
        className="absolute -inset-x-10 -top-10 -bottom-10 -z-10 rounded-[3rem] opacity-40 blur-3xl"
        style={{ background: "linear-gradient(135deg, var(--brand-start), var(--brand-end))" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass-panel relative rounded-3xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-500">ABC Restaurant</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold text-ink-900">4.8</span>
              <span className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-1 text-sm text-ink-500">1,284 Reviews · +24% growth</p>

        <div className="mt-5 h-24 w-full overflow-hidden rounded-xl bg-surface-muted p-3">
          <svg viewBox="0 0 200 60" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--brand-start)" />
                <stop offset="100%" stopColor="var(--brand-end)" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="url(#heroLine)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="0,45 25,40 50,42 75,28 100,32 125,18 150,22 175,10 200,14"
            />
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-surface-muted p-3">
            <Send className="h-3.5 w-3.5 text-ink-400" />
            <p className="mt-2 text-lg font-semibold text-ink-900">1,840</p>
            <p className="text-[11px] text-ink-500">Requests</p>
          </div>
          <div className="rounded-xl bg-surface-muted p-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-ink-400" />
            <p className="mt-2 text-lg font-semibold text-ink-900">1,420</p>
            <p className="text-[11px] text-ink-500">Completed</p>
          </div>
          <div className="rounded-xl bg-surface-muted p-3">
            <Percent className="h-3.5 w-3.5 text-ink-400" />
            <p className="mt-2 text-lg font-semibold text-ink-900">77%</p>
            <p className="text-[11px] text-ink-500">Conversion</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="glass-panel animate-float-slow absolute -left-10 top-6 hidden w-48 rounded-2xl p-3 sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-soft text-success">
            <Star className="h-4 w-4 fill-current" />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink-900">New 5★ review</p>
            <p className="text-[11px] text-ink-500">from Sarah M.</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="glass-panel animate-float-slower absolute -right-6 bottom-2 hidden w-52 rounded-2xl p-3 sm:block"
      >
        <p className="text-[11px] font-medium text-ink-500">Post-Purchase Campaign</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-900">Running</span>
          <span className="flex h-2 w-2 rounded-full bg-success" />
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full w-4/5 rounded-full bg-brand-gradient" />
        </div>
      </motion.div>
    </div>
  );
}
