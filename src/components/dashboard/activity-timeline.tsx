"use client";

import {
  STAGE_LABELS,
  SIGNAL_LABELS,
  CONCERN_LABELS,
  type PipelineStage,
  type EngagementSignal,
  type Concern,
} from "@/lib/constants/pipeline";
import type { SelectedProspectDetail } from "./contact-drawer";

interface ActivityTimelineProps {
  prospect: SelectedProspectDetail;
}

interface TimelineEntry {
  id: string;
  timestamp: string;
  type: "note" | "status" | "signal" | "concern" | "heat";
  description: string;
  detail?: string;
  dotColor: string;
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function buildEntries(prospect: SelectedProspectDetail): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // Notes -> blue dot
  for (const note of prospect.notes) {
    entries.push({
      id: `note-${note.id}`,
      timestamp: note.created_at,
      type: "note",
      description: "Note added",
      detail: note.body,
      dotColor: "bg-alpha-blue",
    });
  }

  // Status history -> purple dot
  for (const sh of prospect.statusHistory) {
    const oldLabel =
      STAGE_LABELS[sh.old_status as PipelineStage] ?? sh.old_status;
    const newLabel =
      STAGE_LABELS[sh.new_status as PipelineStage] ?? sh.new_status;
    entries.push({
      id: `status-${sh.id}`,
      timestamp: sh.changed_at,
      type: "status",
      description: `Stage changed from ${oldLabel} to ${newLabel}`,
      dotColor: "bg-purple-500",
    });
  }

  // Audit log entries
  for (const entry of prospect.auditEntries) {
    const meta = entry.metadata ?? {};

    if (entry.action === "signal-toggle") {
      const signalId = meta.signal_id as string;
      const active = meta.active as boolean;
      const label =
        SIGNAL_LABELS[signalId as EngagementSignal] ?? signalId;
      entries.push({
        id: `audit-${entry.id}`,
        timestamp: entry.created_at,
        type: "signal",
        description: active
          ? `Signal enabled: ${label}`
          : `Signal removed: ${label}`,
        dotColor: "bg-success",
      });
    } else if (entry.action === "concern-update") {
      const concerns = (meta.concerns as string[]) ?? [];
      const labels = concerns.map(
        (c) => CONCERN_LABELS[c as Concern] ?? c
      );
      entries.push({
        id: `audit-${entry.id}`,
        timestamp: entry.created_at,
        type: "concern",
        description: `Concerns updated: ${labels.join(", ") || "cleared"}`,
        dotColor: "bg-alpha-sun",
      });
    } else if (entry.action === "heat-override") {
      const oldHeat = meta.old_heat as number;
      const newHeat = meta.new_heat as number;
      entries.push({
        id: `audit-${entry.id}`,
        timestamp: entry.created_at,
        type: "heat",
        description: `Heat changed from ${oldHeat} to ${newHeat}`,
        dotColor: "bg-alpha-coral",
      });
    }
  }

  // Sort by timestamp descending
  entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return entries;
}

export function ActivityTimeline({ prospect }: ActivityTimelineProps) {
  const entries = buildEntries(prospect);

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-ink-3">
          No activity yet. Add a note or update this prospect to start the
          timeline.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-4">
        Activity
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line" />

        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id} className="relative flex gap-3 items-start pl-0">
              {/* Dot */}
              <span
                className={`relative z-10 mt-1.5 shrink-0 w-[15px] h-[15px] rounded-full border-2 border-paper ${entry.dotColor}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink leading-snug">
                  {entry.description}
                </p>
                {entry.detail && (
                  <p className="text-xs text-ink-3 mt-0.5 line-clamp-2">
                    {entry.detail}
                  </p>
                )}
                <span className="text-[11px] text-ink-4 mt-0.5 block">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
