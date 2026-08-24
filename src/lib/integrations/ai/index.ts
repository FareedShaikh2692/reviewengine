import { env, isMock } from "@/lib/env";

export type ReviewInput = { id: string; rating: number; content: string | null };
export type SentimentResult = {
  reviewId: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  score: number;
  topics: string[];
};
export type InsightsSummary = {
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  topPositiveTopics: string[];
  topImprovementAreas: string[];
  heuristic: boolean;
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Food Quality": ["food", "meal", "dish", "taste", "delicious", "menu"],
  "Customer Service": ["service", "helpful", "friendly", "rude", "attentive"],
  Staff: ["staff", "team", "employee", "waiter", "receptionist"],
  Ambience: ["ambience", "atmosphere", "decor", "vibe", "music"],
  Cleanliness: ["clean", "hygiene", "dirty", "spotless", "tidy"],
  "Waiting Time": ["wait", "slow", "delay", "queue", "line"],
  Pricing: ["price", "expensive", "cheap", "value", "cost", "overpriced"],
  Parking: ["parking", "valet"],
  Delivery: ["delivery", "shipping", "late", "courier"],
};

function heuristicSentiment(review: ReviewInput): SentimentResult {
  const text = (review.content ?? "").toLowerCase();
  const topics = Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => keywords.some((k) => text.includes(k)))
    .map(([topic]) => topic);

  let sentiment: SentimentResult["sentiment"] = "NEUTRAL";
  let score = 0.5;
  if (review.rating >= 4) {
    sentiment = "POSITIVE";
    score = 0.75 + Math.min(review.rating - 4, 1) * 0.2;
  } else if (review.rating <= 2) {
    sentiment = "NEGATIVE";
    score = 0.2;
  }

  return { reviewId: review.id, sentiment, score, topics };
}

/** Sentiment/topic extraction over real stored review text only — never fabricates review content. */
export async function analyzeSentiment(reviews: ReviewInput[]): Promise<{ results: SentimentResult[]; heuristic: boolean }> {
  if (isMock.ai || reviews.length === 0) {
    return { results: reviews.map(heuristicSentiment), heuristic: true };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Analyze the sentiment of each customer review below and extract topics from this fixed list: ${Object.keys(TOPIC_KEYWORDS).join(", ")}. Return ONLY a JSON array of {"reviewId":string,"sentiment":"POSITIVE"|"NEUTRAL"|"NEGATIVE","score":number 0-1,"topics":string[]}. Do not invent review content, only analyze what is given.\n\nReviews:\n${reviews
              .map((r) => `id=${r.id} rating=${r.rating} text="${(r.content ?? "").replace(/"/g, "'")}"`)
              .join("\n")}`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);

    const data = (await res.json()) as { content: Array<{ type: string; text?: string }> };
    const text = data.content.find((c) => c.type === "text")?.text ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as SentimentResult[];
    return { results: parsed, heuristic: false };
  } catch {
    return { results: reviews.map(heuristicSentiment), heuristic: true };
  }
}

export function summarizeInsights(results: SentimentResult[], heuristic: boolean): InsightsSummary {
  const total = results.length || 1;
  const positive = results.filter((r) => r.sentiment === "POSITIVE").length;
  const negative = results.filter((r) => r.sentiment === "NEGATIVE").length;
  const neutral = total - positive - negative;

  const topicCounts = new Map<string, { positive: number; negative: number }>();
  for (const r of results) {
    for (const topic of r.topics) {
      const entry = topicCounts.get(topic) ?? { positive: 0, negative: 0 };
      if (r.sentiment === "POSITIVE") entry.positive += 1;
      if (r.sentiment === "NEGATIVE") entry.negative += 1;
      topicCounts.set(topic, entry);
    }
  }

  const topPositiveTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1].positive - a[1].positive)
    .filter(([, v]) => v.positive > 0)
    .slice(0, 5)
    .map(([topic]) => topic);

  const topImprovementAreas = [...topicCounts.entries()]
    .sort((a, b) => b[1].negative - a[1].negative)
    .filter(([, v]) => v.negative > 0)
    .slice(0, 5)
    .map(([topic]) => topic);

  return {
    positivePct: Math.round((positive / total) * 100),
    neutralPct: Math.round((neutral / total) * 100),
    negativePct: Math.round((negative / total) * 100),
    topPositiveTopics,
    topImprovementAreas,
    heuristic,
  };
}
