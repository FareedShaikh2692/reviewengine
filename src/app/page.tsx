import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  Users,
  MessageSquareText,
  Workflow,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Building2,
  Coffee,
  Hotel,
  Scissors,
  Stethoscope,
  Dumbbell,
  Home as HomeIcon,
  Car,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Plane,
  Wrench,
  MapPin,
} from "lucide-react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { HeroMockup } from "@/components/marketing/hero-mockup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

const industries = [
  { label: "Restaurants", icon: Building2 },
  { label: "Cafes", icon: Coffee },
  { label: "Hotels", icon: Hotel },
  { label: "Salons & Spas", icon: Scissors },
  { label: "Clinics & Dentists", icon: Stethoscope },
  { label: "Gyms & Fitness", icon: Dumbbell },
  { label: "Real Estate", icon: HomeIcon },
  { label: "Automotive", icon: Car },
  { label: "Retail & E-commerce", icon: ShoppingBag },
  { label: "Professional Services", icon: Briefcase },
  { label: "Education", icon: GraduationCap },
  { label: "Travel", icon: Plane },
  { label: "Home Services", icon: Wrench },
  { label: "Local Businesses", icon: MapPin },
];

const features = [
  {
    icon: Users,
    title: "Customer management",
    description: "Import, tag, and segment customers from CSV, Excel, or your CRM — one clean record per relationship.",
  },
  {
    icon: MessageSquareText,
    title: "Review-request campaigns",
    description: "Send perfectly-timed email, SMS, or WhatsApp requests with automatic reminders that never nag.",
  },
  {
    icon: Workflow,
    title: "Visual automation builder",
    description: "Design follow-up sequences on a node canvas — trigger, wait, send, branch — no code required.",
  },
  {
    icon: BarChart3,
    title: "AI review analytics",
    description: "Sentiment, top compliments, and top complaints extracted from real reviews — never fabricated.",
  },
  {
    icon: ShieldCheck,
    title: "Built for compliance",
    description: "Consent tracking, unsubscribe, and do-not-contact status respected on every single send.",
  },
  {
    icon: Sparkles,
    title: "Multi-location, multi-team",
    description: "Manage every location and teammate from one premium dashboard with role-based access.",
  },
];

const steps = [
  { step: "01", title: "Find your business", description: "Search and confirm your business profile in seconds." },
  { step: "02", title: "Connect & import customers", description: "Connect review platforms and bring in your customer list." },
  { step: "03", title: "Send review requests", description: "Launch a campaign or automation that reaches customers at the right moment." },
  { step: "04", title: "Watch reviews grow", description: "Track every request and celebrate real reviews from real customers." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
            <div>
              <Badge variant="brand" className="mb-5">
                <Sparkles className="h-3 w-3" /> AI-powered review growth
              </Badge>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                Get More Genuine Reviews.{" "}
                <span className="text-brand-gradient">Grow Your Business.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
                Review Engine helps businesses turn happy customers into authentic reviews with
                automated review-request campaigns and powerful review analytics.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/search">
                    Find My Business <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <a href="#how-it-works">
                    <PlayCircle className="h-4 w-4" /> See How It Works
                  </a>
                </Button>
              </div>
              <p className="mt-8 text-xs uppercase tracking-wider text-ink-400">
                Trusted across restaurants · clinics · hotels · salons · real estate · and more
              </p>
            </div>
            <HeroMockup />
          </div>
        </section>

        {/* Industries */}
        <section id="industries" className="border-y border-border bg-surface py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-ink-400">
              Built for every service-based industry
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
              {industries.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background px-3 py-5 text-center transition hover:-translate-y-0.5 hover:shadow-premium"
                >
                  <Icon className="h-5 w-5 text-brand-mid" />
                  <span className="text-xs font-medium text-ink-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                Everything you need to turn happy customers into reviews
              </h2>
              <p className="mt-4 text-ink-500">
                One premium platform for the entire review-growth lifecycle — from first request to AI insight.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="transition hover:-translate-y-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient/10">
                    <Icon className="h-5 w-5" style={{ color: "var(--brand-mid)" }} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border bg-surface py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">How it works</h2>
              <p className="mt-4 text-ink-500">From search to authentic review in four simple steps.</p>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ step, title, description }) => (
                <div key={step} className="relative">
                  <span className="text-5xl font-bold text-border">{step}</span>
                  <h3 className="mt-3 text-base font-semibold text-ink-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-ink-500">Start free. Upgrade as your review engine grows.</p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Free", price: "$0", blurb: "1 business · 100 customers · 100 requests" },
                { name: "Growth", price: "$49", blurb: "Multiple campaigns · automation · AI insights", highlight: true },
                { name: "Pro", price: "$149", blurb: "Multi-location · unlimited campaigns · team" },
                { name: "Enterprise", price: "Custom", blurb: "Custom limits · API access · priority support" },
              ].map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.highlight ? "border-transparent shadow-glow ring-2 ring-brand-mid/40" : ""}
                >
                  {plan.highlight && <Badge variant="brand" className="mb-3">Most popular</Badge>}
                  <p className="text-sm font-medium text-ink-500">{plan.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-ink-900">
                    {plan.price}
                    {plan.price !== "Custom" && <span className="text-sm font-normal text-ink-400">/mo</span>}
                  </p>
                  <p className="mt-3 text-sm text-ink-500">{plan.blurb}</p>
                  <Button variant={plan.highlight ? "primary" : "secondary"} className="mt-6 w-full" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="bg-brand-gradient relative overflow-hidden rounded-[2rem] px-10 py-16 text-center text-white shadow-glow">
              <div className="grid-fade absolute inset-0 opacity-20" />
              <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to turn happy customers into reviews?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-white/80">
                Find your business and see your current review stats in under a minute.
              </p>
              <div className="relative mt-8">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/search">
                    Find My Business <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
