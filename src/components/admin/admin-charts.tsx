"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { AnalyticsChart } from "@/components/ui/analytics-chart";

const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f59e0b", "#22c55e", "#0ea5e9"];

function Industry({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="mt-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--ink-400)" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--ink-400)" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)" }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Growth({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="mt-4">
      <AnalyticsChart data={data} xKey="date" yKey="count" variant="line" height={288} />
    </div>
  );
}

export const AdminCharts = { Industry, Growth };
