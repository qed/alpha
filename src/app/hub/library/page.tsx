import Link from "next/link";

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-[-0.025em] mb-3 text-ink">
          Library
        </h1>
        <p className="text-lg leading-[1.6] text-ink-3 mb-8">
          Reference materials for championing Alpha School are coming soon.
          FAQs, testimonials, and talking points — all in one place.
        </p>
        <Link
          href="/hub"
          className="font-[family-name:var(--font-display)] font-bold text-[14px] tracking-[.06em] uppercase text-alpha-blue hover:text-alpha-blue-600 transition-colors"
        >
          &larr; Back to the Hub
        </Link>
      </div>
    </div>
  );
}
