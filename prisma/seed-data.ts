export const PLAN_DEFS = [
  { key: "FREE" as const, name: "Free", priceMonthly: 0, priceYearly: 0, limits: { businesses: 1, customers: 100, reviewRequests: 100, locations: 1, teamMembers: 1 }, features: ["Basic analytics"] },
  { key: "GROWTH" as const, name: "Growth", priceMonthly: 4900, priceYearly: 49000, limits: { businesses: 1, customers: 1000, reviewRequests: 5000, locations: 3, teamMembers: 5 }, features: ["Multiple campaigns", "Advanced analytics", "Automation", "AI insights"] },
  { key: "PRO" as const, name: "Pro", priceMonthly: 14900, priceYearly: 149000, limits: { businesses: 3, customers: 10000, reviewRequests: 50000, locations: 20, teamMembers: 20 }, features: ["Multiple locations", "Unlimited campaigns", "Advanced automation", "AI analytics", "Team members"] },
  { key: "ENTERPRISE" as const, name: "Enterprise", priceMonthly: 0, priceYearly: 0, limits: { businesses: -1, customers: -1, reviewRequests: -1, locations: -1, teamMembers: -1 }, features: ["Custom limits", "Multiple businesses", "Advanced permissions", "API access", "Priority support"] },
];

export const PLATFORM_DEFS = [
  { key: "GOOGLE", name: "Google", reviewUrlTemplate: "https://search.google.com/local/writereview?placeid={{placeId}}" },
  { key: "YELP", name: "Yelp", reviewUrlTemplate: "https://www.yelp.com/writeareview/biz/{{yelpId}}" },
  { key: "FACEBOOK", name: "Facebook", reviewUrlTemplate: "https://www.facebook.com/{{pageId}}/reviews" },
  { key: "TRIPADVISOR", name: "TripAdvisor", reviewUrlTemplate: "https://www.tripadvisor.com/UserReview-{{locationId}}" },
  { key: "TRUSTPILOT", name: "Trustpilot", reviewUrlTemplate: "https://www.trustpilot.com/evaluate/{{domain}}" },
];
