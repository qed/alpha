import Link from "next/link";

export default function HubNotFound() {
  return (
    <div className="max-w-[920px] mx-auto px-8 py-10 max-sm:px-5 max-sm:py-8">
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[clamp(24px,5vw,36px)] leading-[1.1] tracking-[-0.03em] mb-2 text-ink">
        Page not found
      </h1>
      <p className="text-[15px] leading-[1.6] text-ink-3 mb-8">
        The page you&rsquo;re looking for doesn&rsquo;t exist in the Champions
        Hub.
      </p>
      <nav className="flex gap-6">
        <Link
          href="/hub"
          className="text-alpha-blue hover:underline no-underline font-medium text-[15px]"
        >
          Intro
        </Link>
        <Link
          href="/hub/library"
          className="text-alpha-blue hover:underline no-underline font-medium text-[15px]"
        >
          Library
        </Link>
      </nav>
    </div>
  );
}
