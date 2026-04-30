import Image from "next/image";
import Link from "next/link";

export function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/88 backdrop-blur-[12px] border-b border-line">
      <div className="max-w-[1200px] mx-auto px-8 py-[18px] flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 no-underline text-ink">
          <Image
            src="/artifacts/Alpha Toronto.jpg"
            alt="Alpha Toronto"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
          <div>
            <div className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[.16em] uppercase text-ink-4 leading-none mt-0.5">
              Parents Hub
            </div>
          </div>
        </Link>
        <div className="ml-auto flex gap-3 items-center">
          <Link
            href="/hub"
            className="text-sm font-medium text-ink-2 no-underline"
          >
            The Hub
          </Link>
          <a
            className="font-[family-name:var(--font-display)] font-bold text-[11px] tracking-[.08em] uppercase bg-alpha-blue text-white shadow-blue rounded-full px-7 py-[9px] no-underline inline-flex items-center hover:bg-alpha-blue-600 hover:-translate-y-px transition-all duration-150"
            href="https://community.alpha.school/?ref=UFB2FW8LX"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the Community
          </a>
        </div>
      </div>
    </nav>
  );
}
