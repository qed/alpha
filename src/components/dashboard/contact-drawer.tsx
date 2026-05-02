"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DrawerHeader } from "./drawer-header";
import { CopilotCard } from "./copilot-card";
import { ActivityTimeline } from "./activity-timeline";
import { DrawerAside } from "./drawer-aside";
import type { PipelineStage } from "@/lib/constants/pipeline";

// ---------------------------------------------------------------------------
// Types shared across drawer sub-components
// ---------------------------------------------------------------------------

export interface DrawerChild {
  id: string;
  first_name: string;
  grade: string | null;
  age: number | null;
  gender: string | null;
}

export interface DrawerNote {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
}

export interface DrawerStatusHistory {
  id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  changed_at: string;
}

export interface DrawerAuditEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor_id: string;
}

export interface DrawerLibrarySend {
  id: string;
  library_item_id: string;
  channel: string;
  sent_at: string;
}

export interface SelectedProspectDetail {
  id: string;
  parent_first: string;
  parent_last: string;
  parent_email: string | null;
  parent_phone: string | null;
  spouse_name: string | null;
  source: string | null;
  status: PipelineStage;
  heat_score: number;
  concerns: string[];
  engagement_signals: string[];
  last_touch_at: string;
  neighborhood: string | null;
  follow_up_date: string | null;
  first_responded_at: string | null;
  consent_given: boolean;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
  children: DrawerChild[];
  notes: DrawerNote[];
  statusHistory: DrawerStatusHistory[];
  auditEntries: DrawerAuditEntry[];
  librarySends: DrawerLibrarySend[];
}

interface ContactDrawerProps {
  prospect: SelectedProspectDetail;
}

export function ContactDrawer({ prospect }: ContactDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeDrawer = useCallback(() => {
    // Build URL without the prospect param
    const params = new URLSearchParams(searchParams.toString());
    params.delete("prospect");
    const qs = params.toString();
    router.push(`/hub/pipeline${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  // Escape key closes drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawer]);

  return (
    <div
      className="fixed top-0 right-0 bottom-0 w-[920px] max-w-full bg-paper border-l border-line shadow-lg z-40 flex flex-col"
      data-testid="contact-drawer"
    >
      {/* Close button (mobile-friendly) */}
      <button
        type="button"
        onClick={closeDrawer}
        className="absolute top-4 right-4 z-50 p-1.5 rounded-sm text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors"
        aria-label="Close drawer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <DrawerHeader prospect={prospect} />

        {/* Body: two-column on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row">
          {/* Main column */}
          <div className="flex-1 md:w-[560px] md:min-w-[360px] p-6 space-y-6">
            <CopilotCard prospect={prospect} />
            <ActivityTimeline prospect={prospect} />
          </div>

          {/* Aside column */}
          <div className="md:w-[360px] md:min-w-[300px] border-t md:border-t-0 md:border-l border-line">
            <DrawerAside prospect={prospect} />
          </div>
        </div>
      </div>
    </div>
  );
}
