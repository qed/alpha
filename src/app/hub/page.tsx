import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PublicNavbar } from "@/components/shared/public-navbar";

export default async function HubPage() {
  const { userId, sessionClaims } = await auth();

  if (userId) {
    const role = (sessionClaims?.role as string) || "champion";
    if (role === "admin") {
      redirect("/hub/leaderboard");
    }
    redirect("/hub/dashboard");
  }

  return (
    <div className="bg-paper text-ink">
      <PublicNavbar variant="hub" />

      {/* HERO */}
      <section
        className="relative bg-alpha-blue text-white overflow-hidden bg-cover bg-center"
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
        <div className="max-w-[800px] mx-auto px-8 pt-[100px] pb-[80px] relative z-[2] max-sm:px-5 max-sm:pt-[60px] max-sm:pb-[60px]">
          <div className="bg-[rgba(0,0,80,0.45)] backdrop-blur-[12px] rounded-xl p-12 pb-10 max-sm:p-7 max-sm:pb-7">
            <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[clamp(40px,6vw,72px)] leading-[0.98] tracking-[-0.04em] mb-5 text-white">
              Welcome to the{" "}
              <em className="font-[family-name:var(--font-editorial)] italic font-normal tracking-[-0.02em] text-alpha-sky">
                Alpha Parents Hub.
              </em>
            </h1>
            <p className="text-xl leading-[1.4] text-white/85">
              Tools and resources for champions leading Alpha School in their
              community.
            </p>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="px-8 pt-20 pb-12 max-sm:px-5 max-sm:pt-12">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mb-5 text-ink">
            You believe in Alpha School
          </h2>
          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            You&rsquo;ve seen what Alpha can do for families and you want to
            bring it to your community. But talking to parents, answering their
            questions, and keeping track of conversations takes real effort.
          </p>
          <p className="text-lg leading-[1.7] text-ink-2">
            The Alpha Parents Hub gives you the tools to make that easier&mdash;so
            you can focus on the conversations that matter.
          </p>
        </div>
      </section>

      {/* TOOLS PREVIEW */}
      <section className="px-8 py-12 max-sm:px-5">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mb-8 text-ink text-center">
            What you&rsquo;ll get
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="bg-paper-3 rounded-xl px-7 py-8">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-lg mb-2 text-ink">
                FAQ Library
              </h3>
              <p className="text-[15px] leading-[1.6] text-ink-3">
                Ready-made answers to the questions parents ask most&mdash;from
                academics and accreditation to daily schedules.
              </p>
            </div>
            <div className="bg-paper-3 rounded-xl px-7 py-8">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-lg mb-2 text-ink">
                Parent Testimonials
              </h3>
              <p className="text-[15px] leading-[1.6] text-ink-3">
                Real stories from Alpha families you can share with prospective
                parents to show what the experience is actually like.
              </p>
            </div>
            <div className="bg-paper-3 rounded-xl px-7 py-8">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-lg mb-2 text-ink">
                &ldquo;Why Alpha&rdquo; Talking Points
              </h3>
              <p className="text-[15px] leading-[1.6] text-ink-3">
                Key points about Alpha&rsquo;s academics, outcomes, and
                approach&mdash;organized so you can speak confidently to any
                parent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LEADER FRAMING */}
      <section className="px-8 py-12 max-sm:px-5">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mb-5 text-ink">
            Become a champion for your community
          </h2>
          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            When you join the Hub, you become a leader for Alpha School in your
            area. You&rsquo;ll get access to a dashboard to track the families
            you&rsquo;re talking to and resources to help you have better
            conversations.
          </p>
          <p className="text-lg leading-[1.7] text-ink-2">
            The faster your community reaches its enrollment target, the faster
            Alpha invests in making it real locally.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pt-4 pb-24 max-sm:px-5 max-sm:pb-16">
        <div className="max-w-[680px] mx-auto">
          <div className="bg-paper-3 rounded-xl px-12 py-11 text-center max-sm:px-6 max-sm:py-8">
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mb-4 text-ink">
              Ready to get started?
            </h2>
            <p className="text-lg leading-[1.6] text-ink-3 mb-7 max-w-[52ch] mx-auto">
              Sign in to access your dashboard, or create an account to join as a
              champion.
            </p>
            <Link
              href="/hub/sign-in"
              className="font-[family-name:var(--font-display)] font-bold text-[15px] tracking-[.08em] uppercase bg-alpha-blue text-white shadow-blue rounded-full px-9 py-[18px] no-underline inline-flex items-center hover:bg-alpha-blue-600 hover:-translate-y-px transition-all duration-150"
            >
              Enter the Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
