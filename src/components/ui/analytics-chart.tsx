"use client";

import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CHART_TOOLTIP_STYLE = { borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)" };
const AXIS_TICK = { fontSize: 11, fill: "var(--ink-400)" };

export function AnalyticsChart({
  data,
  xKey,
  yKey,
  variant = "area",
  color = "var(--brand-mid)",
  height = 256,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  variant?: "area" | "line";
  color?: string;
  height?: number;
}) {
  const gradientId = `analytics-chart-${yKey}`;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {variant === "area" ? (
          <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: "var(--ink-900)", fontWeight: 600 }} />
            <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} interval={Math.max(Math.floor(data.length / 8), 0)} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: "var(--ink-900)", fontWeight: 600 }} />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
