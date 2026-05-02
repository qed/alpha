"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  ALLOWED_TRANSITIONS,
  STAGE_LABELS,
  LIBRARY_UI_ENABLED,
  type PipelineStage,
} from "@/lib/constants/pipeline";
import { updateProspectStatus } from "@/lib/actions/prospects";
import { overrideHeat } from "@/lib/actions/pipeline";
import { HeatPips } from "./heat-pips";
import { suggestHeat } from "@/lib/pipeline/copilot-engine";
import type { SelectedProspectDetail } from "./contact-drawer";

interface DrawerHeaderProps {
  prospect: SelectedProspectDetail;
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function LastTouchChip({ value }: { value: string }) {
  const days = daysSince(value);
  let colorClass: string;
  let label: string;

  if (days <= 7) {
    colorClass = "bg-success/10 text-success border-success/20";
    label = days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`;
  } else if (days <= 14) {
    colorClass = "bg-alpha-sun/10 text-warning border-alpha-sun/20";
    label = `${days}d ago`;
  } else {
    colorClass = "bg-danger/10 text-danger border-danger/20";
    label = `${days}d ago`;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}

export function DrawerHeader({ prospect }: DrawerHeaderProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const allowedTransitions = ALLOWED_TRANSITIONS[prospect.status];

  // Build kids string: "2 kids - Port Credit"
  const kidsCount = prospect.children.length;
  const kidsLabel =
    kidsCount === 0
      ? null
      : kidsCount === 1
        ? "1 kid"
        : `${kidsCount} kids`;
  const subline = [kidsLabel, prospect.neighborhood]
    .filter(Boolean)
    .join(" – ");

  const handleStatusChange = async (newStatus: PipelineStage) => {
    setError(null);
    setUpdatingStatus(true);

    const result = await updateProspectStatus({
      prospect_id: prospect.id,
      new_status: newStatus,
      updated_at: prospect.updated_at,
    });

    setUpdatingStatus(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to update status.");
    }
  };

  const handleHeatOverride = async (newHeat: number) => {
    setError(null);
    const result = await overrideHeat({
      prospect_id: prospect.id,
      heat_score: newHeat,
    });

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to update heat.");
    }
  };

  const suggestedHeat = suggestHeat(
    prospect.engagement_signals,
    daysSince(prospect.last_touch_at),
    prospect.status
  );

  return (
    <div className="p-6 border-b border-line space-y-3">
      {error && (
        <div className="p-2 bg-danger/10 border border-danger/20 rounded-sm text-xs text-danger">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between gap-4 pr-8">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink truncate">
            {prospect.parent_first} {prospect.parent_last}
          </h2>
          {subline && (
            <p className="text-sm text-ink-3 mt-0.5">{subline}</p>
          )}
        </div>
        <LastTouchChip value={prospect.last_touch_at} />
      </div>

      {/* Stage, Heat, Actions row */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Current stage badge */}
        <StatusBadge stage={prospect.status} />

        {/* Stage selector */}
        <select
          value=""
          onChange={(e) =>
            handleStatusChange(e.target.value as PipelineStage)
          }
          disabled={updatingStatus || allowedTransitions.length === 0}
          className="px-2 py-1 border border-line rounded-sm text-xs focus:outline-none focus:border-alpha-blue bg-paper text-ink-3"
        >
          <option value="" disabled>
            Move to...
          </option>
          {allowedTransitions.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </option>
          ))}
        </select>

        {/* Heat pips (inline in header) */}
        <div className="flex items-center gap-2">
          <HeatPips
            score={prospect.heat_score}
            suggestedScore={suggestedHeat}
            onOverride={handleHeatOverride}
            size="sm"
          />
        </div>

        {/* Action buttons */}
        {prospect.parent_phone && (
          <a
            href={`tel:${prospect.parent_phone}`}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-alpha-blue border border-alpha-blue/20 rounded-sm hover:bg-alpha-blue/5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
        )}

        <button
          type="button"
          onClick={() => {
            // Scroll to the notes input in the aside
            const notesInput = document.querySelector<HTMLElement>("[data-notes-input]");
            notesInput?.focus();
            notesInput?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-ink-3 border border-line rounded-sm hover:bg-paper-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Log activity
        </button>

        {/* Send from library - hidden when flag is false */}
        {LIBRARY_UI_ENABLED && (
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-alpha-blue rounded-sm hover:bg-alpha-blue-600 transition-colors"
          >
            Send from library
          </button>
        )}
      </div>
    </div>
  );
}
