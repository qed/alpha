import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HubPage() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <>
      {/* Hero */}
      <section
        className="relative text-white overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/artifacts/Alpha School Toronto.jpg')",
        }}
      >
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,80,0.72) 0%, rgba(0,0,180,0.78) 100%)",
          }}
        />
        <div className="max-w-[920px] mx-auto px-8 pt-10 pb-10 relative z-[2] max-sm:px-5 max-sm:pt-8 max-sm:pb-6">
          <div className="bg-[rgba(0,0,80,0.45)] backdrop-blur-[12px] rounded-xl p-10 pb-8 max-sm:p-6 max-sm:pb-6">
            <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[clamp(24px,5vw,40px)] leading-[1.05] tracking-[-0.03em] mb-3 text-white">
              Alpha Champions Hub
            </h1>
            <p className="text-[clamp(14px,2.5vw,18px)] leading-[1.4] text-white/85 mb-6">
              Tools and resources to champion Alpha School in your community.
            </p>
            <p className="text-[15px] leading-[1.6] text-white/70">
              You&rsquo;ve seen what Alpha can do — now bring it to your
              neighborhood. The Hub gives you everything you need to talk to
              parents, answer their questions, and grow your local community.
            </p>
          </div>

          {/* Resources */}
          <div className="bg-paper-3 rounded-xl px-10 py-9 mt-6 max-sm:px-6 max-sm:py-7">
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[20px] tracking-[-0.025em] mb-5 text-ink text-center">
              Resources
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/hub/library#faq"
                className="bg-paper rounded-lg px-5 py-5 border border-line hover:shadow-md hover:-translate-y-px transition-all duration-150 no-underline"
              >
                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm mb-1.5 text-ink">
                  FAQ Library
                </h3>
                <p className="text-[13px] leading-[1.5] text-ink-3">
                  Ready-made answers to the questions parents ask most.
                </p>
              </Link>
              <Link
                href="/hub/library#testimonials"
                className="bg-paper rounded-lg px-5 py-5 border border-line hover:shadow-md hover:-translate-y-px transition-all duration-150 no-underline"
              >
                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm mb-1.5 text-ink">
                  Parent Testimonials
                </h3>
                <p className="text-[13px] leading-[1.5] text-ink-3">
                  Real stories from Alpha families to share with prospective
                  parents.
                </p>
              </Link>
              <Link
                href="/hub/library#talking-points"
                className="bg-paper rounded-lg px-5 py-5 border border-line hover:shadow-md hover:-translate-y-px transition-all duration-150 no-underline"
              >
                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm mb-1.5 text-ink">
                  &ldquo;Why Alpha&rdquo; Talking Points
                </h3>
                <p className="text-[13px] leading-[1.5] text-ink-3">
                  Key points so you can speak confidently to any parent.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-8 max-sm:px-5 max-sm:py-6">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="bg-paper-3 rounded-xl px-10 py-9 max-sm:px-6 max-sm:py-7">
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[24px] tracking-[-0.025em] mb-3 text-ink">
              Ready? Start championing Alpha.
            </h2>
            {isAuthenticated ? (
              <Link
                href="/hub/dashboard"
                className="font-[family-name:var(--font-display)] font-bold text-[14px] tracking-[.08em] uppercase bg-alpha-blue text-white shadow-blue rounded-full px-8 py-4 no-underline inline-flex items-center hover:bg-alpha-blue-600 hover:-translate-y-px transition-all duration-150"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/hub/sign-in"
                className="font-[family-name:var(--font-display)] font-bold text-[14px] tracking-[.08em] uppercase bg-alpha-blue text-white shadow-blue rounded-full px-8 py-4 no-underline inline-flex items-center hover:bg-alpha-blue-600 hover:-translate-y-px transition-all duration-150"
              >
                Enter the Hub
              </Link>
            )}
          </div>
        </div>
      </section>

    </>
  );
}
