"use client";

import {
  deriveNextMove,
  suggestHeat,
  type ProspectForCopilot,
} from "@/lib/pipeline/copilot-engine";
import { CONCERN_LABELS, type Concern } from "@/lib/constants/pipeline";
import type { SelectedProspectDetail } from "./contact-drawer";

interface CopilotCardProps {
  prospect: SelectedProspectDetail;
}

import { daysSince } from "@/lib/utils/dates";

function buildBriefing(prospect: SelectedProspectDetail): string {
  const days = daysSince(prospect.last_touch_at);
  const heat = prospect.heat_score;
  const primaryConcern = prospect.concerns[0] as Concern | undefined;
  const stage = prospect.status;

  const parts: string[] = [];

  // Recency
  if (days === 0) {
    parts.push("Touched today");
  } else if (days === 1) {
    parts.push("Last touch was yesterday");
  } else {
    parts.push(`${days} days since last touch`);
  }

  // Heat
  if (heat >= 4) {
    parts.push("running hot");
  } else if (heat <= 2) {
    parts.push("cooling off");
  }

  // Primary concern
  if (primaryConcern) {
    const label = CONCERN_LABELS[primaryConcern] ?? primaryConcern;
    parts.push(`primary concern is ${label.toLowerCase()}`);
  }

  // Stage context
  if (stage === "shadow-day") {
    parts.push("shadow day pending");
  } else if (stage === "committed") {
    parts.push("committed and moving toward enrollment");
  }

  return parts.join(", ") + ".";
}

export function CopilotCard({ prospect }: CopilotCardProps) {
  const days = daysSince(prospect.last_touch_at);
  const hasConcerns = prospect.concerns.length > 0;
  const hasSignals = prospect.engagement_signals.length > 0;
  const isNew = !hasConcerns && !hasSignals;

  // Build sentConcerns from library sends so rule 3 stops firing for addressed concerns
  const sentConcerns = new Set(
    prospect.librarySends
      .map((s) => s.concern)
      .filter((c): c is string => c != null)
  );

  const copilotData: ProspectForCopilot = {
    stage: prospect.status,
    heat_score: prospect.heat_score,
    concerns: prospect.concerns,
    daysSinceLastTouch: days,
  };

  const nextMove = deriveNextMove(copilotData, sentConcerns);
  const briefing = buildBriefing(prospect);

  return (
    <div className="rounded-md bg-gradient-to-r from-alpha-blue to-alpha-blue-700 p-5 text-white shadow-blue">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Conversation Co-pilot
        </span>
      </div>

      {isNew ? (
        /* R33 empty state: new prospect with no data */
        <p className="text-sm text-white/80">
          New prospect — update concerns and signals to get recommendations.
        </p>
      ) : (
        <>
          {/* Summary / briefing in Instrument Serif italic */}
          <p className="font-[family-name:var(--font-editorial)] italic text-base leading-relaxed mb-4 text-white/90">
            {briefing}
          </p>

          {/* Suggested next move pill */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-alpha-sun" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
              </svg>
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 block mb-1">
                Suggested next move
              </span>
              <span className="inline-block px-3 py-1.5 bg-white/15 rounded-pill text-sm font-medium">
                {nextMove.message}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
