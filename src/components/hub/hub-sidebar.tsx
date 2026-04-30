"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const WORKSPACE_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/hub/dashboard", requiresAuth: true, icon: "home" },
  { id: "pipeline", label: "Pipeline", href: "/hub/pipeline", requiresAuth: true, icon: "pipeline" },
  { id: "library", label: "Library", href: "/hub/library", requiresAuth: false, icon: "library" },
  { id: "events", label: "Events", href: "/hub/events", requiresAuth: true, icon: "events" },
  { id: "my-page", label: "My Page", href: "/hub/my-page", requiresAuth: true, icon: "page" },
] as const;

function NavIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 shrink-0 opacity-85";
  switch (type) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "pipeline":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    case "library":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "events":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "page":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    default:
      return null;
  }
}

function LockIcon() {
  return (
    <svg className="w-3 h-3 shrink-0 opacity-50 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

interface HubSidebarProps {
  isAuthenticated: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function HubSidebar({ isAuthenticated, isOpen, onClose }: HubSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleNavClick = useCallback(
    (item: (typeof WORKSPACE_ITEMS)[number]) => {
      if (item.requiresAuth && !isAuthenticated) {
        router.push(`/hub/sign-in?redirect_url=${item.href}`);
      } else {
        router.push(item.href);
      }
      onClose();
    },
    [isAuthenticated, router, onClose]
  );

  // Focus trap and Escape handling for mobile drawer
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && sidebarRef.current) {
        const focusableEls = sidebarRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    sidebarRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const isIntroActive = pathname === "/hub";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        tabIndex={-1}
        className={[
          "bg-ink text-white flex flex-col gap-1 w-60 h-screen overflow-y-auto",
          // Desktop: static in grid
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50",
          "max-lg:transition-transform max-lg:duration-200",
          isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          "lg:sticky lg:top-0",
        ].join(" ")}
        role="navigation"
        aria-label="Champions Hub"
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-5 border-b border-white/10 mb-3">
          <Image
            src="/assets/logo-white.svg"
            alt="Alpha"
            width={80}
            height={24}
            className="h-6 w-auto"
          />
          <div className="font-[family-name:var(--font-display)]">
            <span className="block text-white font-extrabold text-[11px] tracking-[0.16em] uppercase leading-tight">
              Champions
            </span>
            <span className="block text-white/55 font-bold text-[9px] tracking-[0.18em] uppercase leading-tight">
              Hub
            </span>
          </div>
        </div>

        {/* Intro link */}
        <Link
          href="/hub"
          className={[
            "flex items-center gap-3 px-5 py-2 text-[13px] font-medium border-l-2 transition-all duration-[120ms]",
            isIntroActive
              ? "text-white bg-[rgba(0,0,255,0.18)] border-l-alpha-blue"
              : "text-white/75 border-l-transparent hover:text-white hover:bg-white/[0.04]",
          ].join(" ")}
          onClick={onClose}
        >
          <svg className="w-4 h-4 shrink-0 opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Intro</span>
        </Link>

        {/* Workspace section */}
        <div className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.16em] uppercase text-white/40 px-5 pt-3.5 pb-2">
          Workspace
        </div>

        {WORKSPACE_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const showLock = item.requiresAuth && !isAuthenticated;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              aria-label={
                showLock ? `${item.label} (sign in required)` : item.label
              }
              className={[
                "flex items-center gap-3 px-5 py-2 text-[13px] font-medium border-l-2 transition-all duration-[120ms] w-full text-left cursor-pointer",
                isActive
                  ? "text-white bg-[rgba(0,0,255,0.18)] border-l-alpha-blue"
                  : "text-white/75 border-l-transparent hover:text-white hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <NavIcon type={item.icon} />
              <span>{item.label}</span>
              {showLock && <LockIcon />}
            </button>
          );
        })}

        {/* My Geography section */}
        <div className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.16em] uppercase text-white/40 px-5 pt-3.5 pb-2">
          My Geography
        </div>

        <div className="flex items-center gap-3 px-5 py-2 text-[13px] font-medium text-white/75 border-l-2 border-l-transparent">
          <svg className="w-4 h-4 shrink-0 opacity-85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-white/50 italic text-xs">Set after sign-in</span>
        </div>

        {/* Toronto callout — pushed to bottom */}
        <div className="mt-auto border-t border-white/10 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-white/45">
            Built by Alpha Toronto.{" "}
            <span className="text-white/60">
              Know someone in Toronto?{" "}
              <a
                href="https://alphatoronto.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-alpha-sky underline underline-offset-2 hover:text-white transition-colors"
              >
                alphatoronto.org
              </a>
            </span>
          </p>
        </div>
      </aside>
    </>
  );
}
