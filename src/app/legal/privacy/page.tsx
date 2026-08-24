import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-ink-500">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-700">
            <section>
              <h2 className="text-base font-semibold text-ink-900">What we collect</h2>
              <p className="mt-2">
                Review Engine stores account information you provide (name, email, business details) and the
                customer records you choose to import or add for the purpose of sending review requests. We never
                collect data you have not explicitly provided or imported.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-ink-900">Customer consent</h2>
              <p className="mt-2">
                Every customer record has a consent status. Customers can unsubscribe from any review request link at
                any time, and we will never send further requests to a customer marked unsubscribed or
                do-not-contact.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-ink-900">Data export and deletion</h2>
              <p className="mt-2">
                Business owners can export their full customer list to CSV at any time from the Customers page, and
                delete individual customer records at any time. To request full account deletion, contact your
                account owner or platform support.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-ink-900">Third-party integrations</h2>
              <p className="mt-2">
                We connect to third-party services (Google, email/SMS providers, payment processors) only through
                official APIs and OAuth. We never store your Google password, and integration tokens are encrypted
                at rest.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
