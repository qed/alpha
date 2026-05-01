import { LibraryAccordion } from "@/components/hub/library-accordion";

export default function LibraryPage() {
  return (
    <div className="max-w-[920px] mx-auto px-8 py-10 max-sm:px-5 max-sm:py-8">
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[clamp(24px,5vw,36px)] leading-[1.1] tracking-[-0.03em] mb-2 text-ink">
        Library
      </h1>
      <p className="text-[15px] leading-[1.6] text-ink-3 mb-8">
        Reference materials for championing Alpha School — FAQs, parent
        testimonials, and talking points all in one place.
      </p>
      <LibraryAccordion />
    </div>
  );
}
