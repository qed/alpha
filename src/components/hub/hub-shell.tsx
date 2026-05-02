"use client";

import { useState } from "react";
import { HubSidebar } from "./hub-sidebar";

interface HubShellProps {
  isAuthenticated: boolean;
  geographyName?: string | null;
  children: React.ReactNode;
}

export function HubShell({ isAuthenticated, geographyName, children }: HubShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="grid lg:grid-cols-[240px_1fr] grid-cols-1 min-h-screen">
      <HubSidebar
        isAuthenticated={isAuthenticated}
        geographyName={geographyName ?? null}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 bg-paper">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 bg-ink text-white p-2 rounded-lg shadow-md"
          aria-label="Open navigation"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {children}
      </main>
    </div>
  );
}
