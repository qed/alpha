import type { Metadata } from "next";
import { PublicNavbar } from "@/components/shared/public-navbar";

export const metadata: Metadata = {
  title: "For Parents | Alpha Toronto",
  description:
    "A letter to Toronto parents about why Alpha School is the right path for our kids.",
};

export default function ForParentsPage() {
  return (
    <div className="bg-paper text-ink">
      <PublicNavbar variant="for-parents" />

      {/* HERO */}
      <section
        className="relative bg-alpha-blue text-white overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/artifacts/Alpha School Toronto.jpg')",
        }}
      >
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(180deg, rgba(0,0,80,0.72) 0%, rgba(0,0,180,0.78) 100%)" }} />
        <div className="max-w-[800px] mx-auto px-8 pt-[100px] pb-[80px] relative z-[2] max-sm:px-5 max-sm:pt-[60px] max-sm:pb-[60px]">
          <div className="bg-[rgba(0,0,80,0.45)] backdrop-blur-[12px] rounded-xl p-12 pb-10 max-sm:p-7 max-sm:pb-7">
            <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[clamp(40px,6vw,72px)] leading-[0.98] tracking-[-0.04em] mb-5 text-white">
              A letter to{" "}
              <em className="font-[family-name:var(--font-editorial)] italic font-normal tracking-[-0.02em] text-alpha-sky">
                Toronto parents.
              </em>
            </h1>
            <p className="text-xl leading-[1.4] text-white/85">
              Why our family of five is betting on Alpha School&mdash;and why you should take a closer look.
            </p>
          </div>
        </div>
      </section>

      {/* LETTER */}
      <article className="px-8 pt-20 pb-24 max-sm:px-5 max-sm:pt-12 max-sm:pb-16">
        <div className="max-w-[680px] mx-auto">
          <p className="font-[family-name:var(--font-editorial)] italic text-[28px] text-ink mb-8">
            Dear Toronto parents,
          </p>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            We&rsquo;re an academically minded family. We care more than anything about top 1%
            academics. So when I tell you we&rsquo;re choosing Alpha School for all three of our
            children, I want you to understand what that means coming from us.
          </p>

          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mt-12 mb-5 text-ink">
            Caradoc, our oldest
          </h2>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            Our son Caradoc turns 12 in August. He is a &ldquo;top of the top of the class&rdquo;
            student&mdash;the type of 99th percentile kid who would naturally fit in at a school like
            UTS. In his own words:
          </p>

          <blockquote className="font-[family-name:var(--font-editorial)] italic text-[22px] leading-[1.4] text-ink my-7 pl-6 border-l-[3px] border-alpha-blue max-sm:text-[19px]">
            I am a bilingual stage gracing, poetry reading, French Horn playing, AI ethics pondering,
            advanced math calculating, science researching, French literature reading pre-teen who
            wants to explore big ideas in a place where that matters.
          </blockquote>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            He got a perfect 150 on the Waterloo Grade 8 Gauss in 2025&mdash;one of 33 students across
            the country to do so. He made regionals in the Science Fair. He acts in school plays, is
            dabbling with guitar, and is a nerdy social butterfly. We want him to go to a school like
            Oxford or Cambridge. And we think Alpha is a much better path than anything else
            available&mdash;more academically rigorous, but also lets intellectual curiosity flourish
            and shine.
          </p>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            It means a lot to us that the Director of Admissions at Stanford was so impressed with
            every Alpha High School applicant this year that she did a shadow day at Alpha Palo Alto
            and then signed up her two 7-year-old twins.
          </p>

          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mt-12 mb-5 text-ink">
            Cedric, our middle child
          </h2>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            But on the non-academic side, here&rsquo;s a story from an Alpha parent that stopped us in
            our tracks:
          </p>

          {/* PARENT QUOTE CARD */}
          <div className="bg-alpha-blue text-white rounded-xl px-11 py-10 my-9 max-sm:px-6 max-sm:py-7">
            <p className="font-[family-name:var(--font-body)] italic text-lg leading-[1.35] text-white mb-4 max-sm:text-xl">
              &ldquo;My son couldn&rsquo;t swim. He was terrified of the water. One week at Alpha
              School later, he was working on a Navy SEAL swimming challenge and started his own
              business with his classmates. He was eight.&rdquo;
            </p>
            <span className="font-[family-name:var(--font-display)] font-bold text-[13px] tracking-[.08em] uppercase text-alpha-sky">
              &mdash; Eliot G.
            </span>
          </div>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            That&rsquo;s not from us. But Cedric, our 9-year-old, is temperamentally shy yet very
            bright and curious. We want a school where stuff like the above happens: kids are guided
            and mentored to grow and build confidence by taking on new challenges. They go to school in
            an environment where parents, students, and staff are 100% supportive of achievement,
            trying new things, and taking on new challenges. We think Alpha is that type of school.
          </p>

          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mt-12 mb-5 text-ink">
            Cormac, our youngest
          </h2>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            Our youngest, Cormac, is 5 years old. He&rsquo;s been kicking soccer balls since he was a
            year old. I have no idea whether he&rsquo;ll end up being a super athlete or just very
            boisterous. I do know that if he wants to become an athlete, having a path where he can
            maintain the &ldquo;top 1% academics&rdquo; standard our family has is a non-negotiable.
          </p>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            If it turns out that he can do that in 2&ndash;3 hours a day and open his daily and weekly
            schedule for more athletics, and he loves it, then we believe in more soccer for our
            youngest. And we believe Alpha makes that most possible long term.
          </p>

          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mt-12 mb-5 text-ink">
            Why we believe
          </h2>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            So we have three multi-faceted children, but on all dimensions, after talking to half a
            dozen friends whose kids are in Alpha right now in Texas, Florida, and California and
            hearing their stories, our family is firmly convinced this is the right path.
          </p>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            My wife is a school teacher. She is generally against technology in the classroom and feels
            that the intrusion of computers and tech in education has been a detriment to student
            growth and achievement. She also believes in data, and has seen how there are paths to
            better learning outcomes.
          </p>

          <p className="text-lg leading-[1.7] text-ink-2 mb-6">
            So when I say that our family is firmly convinced, what I am saying is that I drank the
            Kool-Aid early, and then my wife took apart all the positives and negatives in great
            detail, and came out on the side of{" "}
            <strong>&ldquo;this is a good thing.&rdquo;</strong>
          </p>

          <p className="font-[family-name:var(--font-editorial)] italic text-2xl text-ink mt-12">
            &mdash; Peter
          </p>

          {/* CTA SECTION */}
          <div className="bg-paper-3 rounded-xl px-12 py-11 mt-12 mb-10 text-center max-sm:px-6 max-sm:py-8">
            <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mb-4 text-ink">
              What happens next
            </h2>
            <p className="text-lg leading-[1.6] text-ink-3 mb-7 max-w-[52ch] mx-auto">
              Join the community, and take a closer look at Alpha. When Toronto gets to 25 refundable
              deposits of $1,000, they will invest resources, get real estate, and set up a shadow day
              or two in Toronto. The faster we get there, the faster we get to see what Alpha is really
              like.
            </p>
            <a
              className="font-[family-name:var(--font-display)] font-bold text-[15px] tracking-[.08em] uppercase bg-alpha-blue text-white shadow-blue rounded-full px-9 py-[18px] no-underline inline-flex items-center hover:bg-alpha-blue-600 hover:-translate-y-px transition-all duration-150"
              href="https://community.alpha.school/?ref=UFB2FW8LX"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the Community
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
