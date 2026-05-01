"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoLightbox } from "./video-lightbox";

const VIDEOS: { youtubeId: string; title: string; thumbnail?: string }[] = [
  { youtubeId: "AsZ-4IlVzpQ", title: "From Good to Great — No Learning Gaps" },
  { youtubeId: "25iE7npgcz8", title: "A Place to Discover and Grow" },
  { youtubeId: "9Hcd3kCh7hI", title: "Real Growth in Action — First 30 Days" },
  { youtubeId: "AbeHTV2y8ZY", title: "How Alpha Made Learning Joyful Again" },
  { youtubeId: "oNgmrvkppIk", title: "Turning Test Anxiety Into Motivation" },
  { youtubeId: "JVSyMEPwVDI", title: "How the Right Fit Changes Everything" },
  { youtubeId: "WcZdpq8Fgtk", title: "Motivation Unlocked" },
  { youtubeId: "eoSs_TDC_RQ", title: "Real Change in Weeks" },
  { youtubeId: "VynSGr43m7Q", title: "Where Kids Love School" },
  { youtubeId: "iEHKf59ANlc", title: "Lulu + Sami — Culture" },
  { youtubeId: "3oIkzR4xQ5s", title: "Empowering Students to Go Further" },
  { youtubeId: "VoWDkNXXLdk", title: "John + Jessica — Culture" },
  { youtubeId: "770rUH1hImg", title: "Where Kids Actually Want School on Saturdays" },
  { youtubeId: "sRmJGrOHKXE", title: "Turning Passions Into Possibilities" },
  { youtubeId: "VvcVOz7nM0A", title: "Kara — Impact" },
  { youtubeId: "vpHCP3mPz4g", title: "Elsbeth + Terak — Why Alpha" },
  { youtubeId: "2qdweuDpFWI", title: "Discovering Potential" },
  { youtubeId: "4S4m1XpqQqA", title: "Why Alpha Was the Best Decision for Our Family" },
  { youtubeId: "CuSijUisnyE", title: "30 Days to a Different Kid" },
  { youtubeId: "WfFS6nxsbx8", title: "The Future Starts at Alpha" },
  { youtubeId: "LnODnKOEp34", title: "A School That Feels Like Family", thumbnail: "/assets/thumbnails/LnODnKOEp34.jpg" },
  { youtubeId: "hFK-0325LP0", title: "Peter + Dana — App Learning" },
  { youtubeId: "JU_XIXU-cuE", title: "The Real Reason These Kids Love Going to School" },
];

const SECTIONS: readonly {
  id: string;
  label: string;
  href?: string;
}[] = [
  { id: "faq", label: "FAQ Library" },
  { id: "testimonials", label: "Parent Testimonials" },
  { id: "talking-points", label: "“Why Alpha” Talking Points" },
  {
    id: "website",
    label: "A full Alpha website",
    href: "/hub/library/website-preview",
  },
];

type SectionId = "faq" | "testimonials" | "talking-points";

const VALID_IDS = new Set<string>(
  SECTIONS.filter((s) => !s.href).map((s) => s.id)
);

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "w-5 h-5 shrink-0 text-ink-4 transition-transform duration-200",
        open ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FaqSection() {
  return (
    <div className="py-2">
      <p className="text-[15px] leading-[1.7] text-ink-2 mb-5">
        Alpha School maintains a comprehensive FAQ covering admissions,
        curriculum, daily schedule, tuition, and everything parents ask most.
        Rather than duplicating that content here, we link directly to the
        source so you always have the latest answers.
      </p>
      <a
        href="https://alpha.school/faq/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-[family-name:var(--font-display)] font-bold text-[14px] tracking-[.06em] uppercase bg-alpha-blue text-white rounded-full px-7 py-3.5 no-underline inline-flex items-center gap-2 hover:bg-alpha-blue-600 hover:-translate-y-px transition-all duration-150 shadow-blue"
      >
        Browse the FAQ
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  );
}

function TestimonialsSection() {
  const [selectedVideo, setSelectedVideo] = useState<
    (typeof VIDEOS)[number] | null
  >(null);

  return (
    <div className="py-2">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEOS.map((video) => (
          <button
            key={video.youtubeId}
            type="button"
            onClick={() => setSelectedVideo(video)}
            className="group text-left rounded-lg overflow-hidden border border-line hover:shadow-md hover:-translate-y-px transition-all duration-150 cursor-pointer bg-paper"
          >
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <img
                src={video.thumbnail ?? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (video.thumbnail) return;
                  const step = target.dataset.fallback;
                  if (!step) {
                    target.dataset.fallback = "1";
                    target.src = `https://img.youtube.com/vi/${video.youtubeId}/sddefault.jpg`;
                  } else if (step === "1") {
                    target.dataset.fallback = "2";
                    target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                  }
                }}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-alpha-blue transition-colors">
                  <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[13px] font-medium text-ink leading-snug line-clamp-2">
                {video.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedVideo && (
        <VideoLightbox
          videoId={selectedVideo.youtubeId}
          title={selectedVideo.title}
          isOpen={true}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

const TALKING_POINTS: {
  heading: string;
  explanation: string;
  detail: string;
}[] = [
  {
    heading: "2-Hour Learning Model",
    explanation:
      "Students master core academics in about two hours per day using AI-powered personalized learning at their own pace.",
    detail:
      "This isn't about shortening school — it's about removing inefficiency. In traditional classrooms, much of the day is spent on lectures, waiting for classmates to catch up, or repeating material already understood. Alpha's model lets students move forward once they master a concept, spend more time where they need support, and progress faster in subjects where they excel. The rest of the full school day is devoted to life skills, enrichment, and real-world learning.",
  },
  {
    heading: "AI-Powered 1:1 Learning",
    explanation:
      "Adaptive technology provides concept-based mastery with no knowledge gaps — students can advance beyond grade level.",
    detail:
      "Every student gets a personalized curriculum from an AI tutor, providing coursework at their individual pace and level. Students progress with concept-based mastery, achieving 90% proficiency in each concept before moving forward. There is no ceiling: a 2nd grader ready for 5th-grade math will engage at that level. Students consistently rank in the top percentiles nationally and progress academically faster than the national average.",
  },
  {
    heading: "Guides, Not Teachers",
    explanation:
      "Adults mentor, motivate, and coach rather than lecture and grade.",
    detail:
      "At Alpha, teachers shift from traditional roles to supporting students' emotional and motivational needs. Instead of standing at the front of a classroom delivering lectures, Guides spend their time coaching, motivating, and truly getting to know each child. Because AI handles routine academic instruction, Guides focus on what humans do best: building trust, developing confidence, and helping every student grow — not just academically, but as a person.",
  },
  {
    heading: "Life Skills & Entrepreneurship",
    explanation:
      "Afternoons are devoted to financial literacy, public speaking, coding, cooking, and entrepreneurship.",
    detail:
      "Traditional education often prioritizes memorization and standardized testing. Alpha believes students should also develop skills that matter in the real world — leadership, communication, entrepreneurship, critical thinking, resilience, and collaboration. Past workshops have included topics like personal finance, brand building, public speaking, and team problem-solving. These skills are intentionally built into every school day.",
  },
  {
    heading: "Physical & Mental Wellness",
    explanation:
      "Daily fitness, mindfulness, and emotional intelligence are built into the schedule.",
    detail:
      "Every day includes structured time for physical activity, mindfulness, and recharging. Students eat, move, rest, and develop emotional intelligence as part of the core program — not as an afterthought. This holistic approach helps students show up as their best selves for learning and life.",
  },
  {
    heading: "Community & Connection",
    explanation:
      "Small cohorts, dedicated mentors, and a culture of belonging.",
    detail:
      "Students thrive when they feel genuinely seen and supported. Alpha's small cohort model means Guides know every student deeply. Because academics are completed efficiently, students actually have more time for collaboration and social interaction than in traditional schools — through team challenges, public speaking events, group projects, and leadership exercises.",
  },
  {
    heading: "Daily Schedule",
    explanation:
      "A tangible day-in-the-life walkthrough showing how academics, wellness, and enrichment fit together.",
    detail:
      "8:45–9:00 AM — Limitless Launch: intention-setting, gratitude, and mindset work. 9:00 AM–12:00 PM — Guided Academic Time: students work with AI tutoring software to master math, reading, and science while Guides provide support. 12:00–1:00 PM — Lunch & Wellness: a real break with structured mindfulness and physical activity. 1:00–3:30 PM — Life Skills & Enrichment: communication, financial literacy, public speaking, coding, cooking, and more.",
  },
  {
    heading: "Outcomes",
    explanation:
      "Students consistently perform in the top percentiles nationally and progress faster than the national average.",
    detail:
      "Alpha students regularly take nationally recognized assessments such as MAP Growth, measured against national benchmarks. Results have consistently shown strong performance, with students frequently progressing academically at an accelerated pace. Graduates have gone on to selective universities, launched businesses, and entered the workforce with confidence and real-world skills.",
  },
  {
    heading: "Student Experience",
    explanation:
      "Kids genuinely love school — driven by freedom, self-pacing, and intrinsic motivation.",
    detail:
      "Alpha students consistently say they love coming to school. They value the freedom to learn at their own pace, the ability to advance beyond their grade level, and a motivation system that rewards effort with meaningful experiences. As students describe it: \"There's no hand holding, and I get to learn at my own pace\" and \"I love Alpha because it's taught me to be limitless.\"",
  },
  {
    heading: "Press & Validation",
    explanation:
      "Alpha School has been featured in major publications validating its innovative approach to education.",
    detail:
      "Alpha has received coverage in The New York Times, Forbes, The Wall Street Journal, Today Show, and Business Insider, among others. The school has been operating for more than a decade, expanding to multiple locations as families seek alternatives to traditional education models. The model combines well-established educational principles — mastery-based learning, personalized instruction, mentorship-based teaching, and project-based learning — refined through years of classroom experience.",
  },
];

function TalkingPointsSection() {
  return (
    <div className="py-2 space-y-6">
      {TALKING_POINTS.map((tp) => (
        <div key={tp.heading}>
          <h3 className="font-[family-name:var(--font-display)] font-bold text-[15px] text-ink mb-1.5">
            {tp.heading}
          </h3>
          <p className="text-[14px] leading-[1.6] text-ink-2 mb-1.5">
            {tp.explanation}
          </p>
          <p className="text-[13px] leading-[1.7] text-ink-3">
            {tp.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

export function LibraryAccordion() {
  const [active, setActive] = useState<SectionId | null>(null);

  const handleHash = useCallback(() => {
    const hash = window.location.hash.slice(1);
    if (VALID_IDS.has(hash)) {
      setActive(hash as SectionId);
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  useEffect(() => {
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [handleHash]);

  const toggle = (id: SectionId) => {
    setActive((prev) => (prev === id ? null : id));
  };

  return (
    <div className="border border-line rounded-xl overflow-hidden divide-y divide-line">
      {SECTIONS.map((section) => {
        if (section.href) {
          return (
            <div key={section.id}>
              <a
                href={section.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-paper-2 transition-colors duration-100"
              >
                <span className="font-[family-name:var(--font-display)] font-bold text-[16px] tracking-[-0.01em] text-ink">
                  {section.label}
                </span>
                <svg
                  className="w-5 h-5 shrink-0 text-ink-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          );
        }

        const isOpen = active === section.id;
        return (
          <div key={section.id} id={section.id}>
            <button
              type="button"
              onClick={() => toggle(section.id as SectionId)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-paper-2 transition-colors duration-100"
            >
              <span className="font-[family-name:var(--font-display)] font-bold text-[16px] tracking-[-0.01em] text-ink">
                {section.label}
              </span>
              <ChevronIcon open={isOpen} />
            </button>
            {isOpen && (
              <div className="px-6 pb-6">
                {section.id === "faq" && <FaqSection />}
                {section.id === "testimonials" && <TestimonialsSection />}
                {section.id === "talking-points" && (
                  <TalkingPointsSection />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
