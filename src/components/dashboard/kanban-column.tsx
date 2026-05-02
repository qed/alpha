"use client";

import { useState } from "react";
import type { PipelineStage } from "@/lib/constants/pipeline";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants/pipeline";
import { KanbanCard } from "./kanban-card";
import type { PipelineRow } from "./pipeline-table";

interface KanbanColumnProps {
  stage: PipelineStage;
  prospects: PipelineRow[];
  isValidDrop: boolean;
  onCardClick: (id: string) => void;
  onDragStart: (e: React.DragEvent, prospect: PipelineRow) => void;
  onDragOver: (e: React.DragEvent, stage: PipelineStage) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, stage: PipelineStage) => void;
}

export function KanbanColumn({
  stage,
  prospects,
  isValidDrop,
  onCardClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const colors = STAGE_COLORS[stage];
  const label = STAGE_LABELS[stage];

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e, stage);
  }

  function handleDragLeave() {
    setIsDragOver(false);
    onDragLeave();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, stage);
  }

  const highlightClass =
    isDragOver && isValidDrop
      ? "ring-2 ring-alpha-blue bg-alpha-sky/20"
      : isDragOver && !isValidDrop
        ? "ring-2 ring-danger/40 bg-danger/5"
        : "";

  return (
    <div
      className={`flex flex-col rounded-sm bg-paper-2 min-h-[200px] transition-all ${highlightClass}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`kanban-column-${stage}`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line">
        <span
          className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}
        >
          {label}
        </span>
        <span className="text-xs text-ink-3 font-medium">
          {prospects.length}
        </span>
      </div>

      {/* Cards area */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {prospects.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[120px] border-2 border-dashed border-line rounded-sm">
            <span className="text-xs text-ink-3">{label}</span>
          </div>
        ) : (
          prospects.map((prospect) => (
            <KanbanCard
              key={prospect.id}
              prospect={prospect}
              onClick={onCardClick}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
