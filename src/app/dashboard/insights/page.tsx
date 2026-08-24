import { Sparkles, ThumbsUp, AlertCircle, Lightbulb } from "lucide-react";
import { getOrgContext } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { summarizeInsights, type SentimentResult } from "@/lib/integrations/ai";
import { generateBusinessInsights } from "@/lib/business-insights";
import { AnalyzeButton } from "@/components/dashboard/insights/analyze-button";

export default async function InsightsPage() {
  const ctx = await getOrgContext();
  if (!ctx) return null;

  const reviews = await db.review.findMany({ where: { organizationId: ctx.organizationId } });
  const analyzed = reviews.filter((r) => r.sentiment);
  const heuristic = reviews.some((r) => r.isMock);

  const results: SentimentResult[] = analyzed.map((r) => ({
    reviewId: r.id,
    sentiment: r.sentiment as "POSITIVE" | "NEUTRAL" | "NEGATIVE",
    score: r.sentimentScore ?? 0.5,
    topics: r.topics,
  }));
  const summary = summarizeInsights(results, heuristic);
  const businessInsights = await generateBusinessInsights(ctx.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">AI Insights</h1>
          <p className="mt-1 text-sm text-ink-500">
            Sentiment and themes extracted from real customer reviews — never fabricated.
          </p>
        </div>
        <AnalyzeButton pending={reviews.length - analyzed.length} />
      </div>

      {summary.heuristic && (
        <Badge variant="warning">Heuristic analysis (connect an AI provider for full language-model analysis)</Badge>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="text-base font-semibold text-ink-900">Overall sentiment</h2>
          <div className="mt-5 space-y-3">
            {[
              { label: "Positive", value: summary.positivePct, color: "var(--success)" },
              { label: "Neutral", value: summary.neutralPct, color: "var(--warning)" },
              { label: "Negative", value: summary.negativePct, color: "var(--danger)" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-700">{s.label}</span>
                  <span className="font-medium text-ink-900">{s.value}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-success" />
            <h2 className="text-base font-semibold text-ink-900">Top positive topics</h2>
          </div>
          <div className="mt-4 space-y-2">
            {summary.topPositiveTopics.length === 0 && <p className="text-sm text-ink-500">Not enough data yet.</p>}
            {summary.topPositiveTopics.map((t) => (
              <div key={t} className="rounded-lg bg-success-soft px-3 py-2 text-sm font-medium text-success">
                {t}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <h2 className="text-base font-semibold text-ink-900">Top improvement areas</h2>
          </div>
          <div className="mt-4 space-y-2">
            {summary.topImprovementAreas.length === 0 && <p className="text-sm text-ink-500">Not enough data yet.</p>}
            {summary.topImprovementAreas.map((t) => (
              <div key={t} className="rounded-lg bg-warning-soft px-3 py-2 text-sm font-medium text-warning">
                {t}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "var(--brand-mid)" }} />
          <h2 className="text-base font-semibold text-ink-900">Business insights</h2>
        </div>
        <div className="mt-4 space-y-2">
          {businessInsights.length === 0 && <p className="text-sm text-ink-500">Not enough data yet — insights appear as reviews come in.</p>}
          {businessInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-700">
              <Lightbulb
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: insight.tone === "positive" ? "var(--success)" : insight.tone === "warning" ? "var(--warning)" : "var(--info)" }}
              />
              {insight.text}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
