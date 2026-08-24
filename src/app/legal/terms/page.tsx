import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-ink-500">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-700">
            <section>
              <h2 className="text-base font-semibold text-ink-900">Genuine reviews only</h2>
              <p className="mt-2">
                Review Engine is built to help businesses collect genuine, authentic feedback from real customers.
                You may not use this platform to generate fake reviews, submit reviews on behalf of customers,
                manipulate ratings, hide legitimate negative feedback, or otherwise violate the terms of any
                connected review platform.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-ink-900">Acceptable use</h2>
              <p className="mt-2">
                You are responsible for obtaining appropriate consent before importing or messaging customers, and
                for complying with applicable messaging and privacy laws in your jurisdiction.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-ink-900">Account and billing</h2>
              <p className="mt-2">
                Plans and limits are described on the pricing page and may be changed by an organization owner at
                any time from Settings → Billing.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
