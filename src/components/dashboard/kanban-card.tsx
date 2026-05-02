"use client";

import type { PipelineRow } from "./pipeline-table";

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
    colorClass = "text-success";
    label = days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`;
  } else if (days <= 14) {
    colorClass = "text-warning";
    label = `${days}d ago`;
  } else {
    colorClass = "text-danger";
    label = `${days}d ago`;
  }

  return <span className={`text-[10px] font-medium ${colorClass}`}>{label}</span>;
}

function HeatPips({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= score ? "bg-alpha-coral" : "bg-line"
          }`}
        />
      ))}
    </span>
  );
}

interface KanbanCardProps {
  prospect: PipelineRow;
  onClick: (id: string) => void;
  onDragStart: (e: React.DragEvent, prospect: PipelineRow) => void;
}

export function KanbanCard({ prospect, onClick, onDragStart }: KanbanCardProps) {
  const name = `${prospect.parent_first} ${prospect.parent_last}`;
  const kidsLabel =
    prospect.child_count === 1
      ? "1 kid"
      : prospect.child_count > 1
        ? `${prospect.child_count} kids`
        : null;
  const subtitle = kidsLabel
    ? prospect.neighborhood
      ? `${kidsLabel} – ${prospect.neighborhood}`
      : kidsLabel
    : prospect.neighborhood ?? null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, prospect)}
      onClick={() => onClick(prospect.id)}
      className="bg-paper rounded-sm border border-line p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
      data-testid={`kanban-card-${prospect.id}`}
    >
      <div className="font-medium text-sm text-ink truncate">{name}</div>
      {subtitle && (
        <div className="text-[11px] text-ink-3 mt-0.5 truncate">{subtitle}</div>
      )}
      <div className="flex items-center justify-between mt-2">
        <HeatPips score={prospect.heat_score} />
        <LastTouchChip value={prospect.last_touch_at} />
      </div>
    </div>
  );
}
