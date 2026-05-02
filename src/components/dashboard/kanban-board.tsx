"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  type PipelineStage,
  STAGE_LABELS,
  isValidTransition,
} from "@/lib/constants/pipeline";
import { KanbanColumn } from "./kanban-column";
import type { PipelineRow } from "./pipeline-table";
import { useToast } from "@/components/ui/toast";

/** The four active kanban columns (lost is hidden per R14). */
const KANBAN_STAGES: PipelineStage[] = [
  "interested",
  "shadow-day",
  "committed",
  "enrolled",
];

interface KanbanBoardProps {
  prospects: PipelineRow[];
  onStageChange: (data: {
    prospect_id: string;
    new_status: PipelineStage;
    updated_at: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function KanbanBoard({ prospects, onStageChange }: KanbanBoardProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Optimistic state: maps prospect id -> overridden stage
  const [optimisticMoves, setOptimisticMoves] = useState<
    Map<string, PipelineStage>
  >(new Map());

  // Track drag source for transition validation
  const [dragSource, setDragSource] = useState<{
    prospectId: string;
    stage: PipelineStage;
  } | null>(null);

  // Group prospects into columns, applying optimistic moves
  const columns = useMemo(() => {
    const grouped: Record<PipelineStage, PipelineRow[]> = {
      interested: [],
      "shadow-day": [],
      committed: [],
      enrolled: [],
      lost: [], // unused but keeps the type complete
    };

    for (const prospect of prospects) {
      const effectiveStage =
        optimisticMoves.get(prospect.id) ?? prospect.status;
      // Skip lost prospects entirely (R14)
      if (effectiveStage === "lost") continue;
      if (grouped[effectiveStage]) {
        grouped[effectiveStage].push(prospect);
      }
    }

    // Sort each column by last_touch_at descending
    for (const stage of KANBAN_STAGES) {
      grouped[stage].sort(
        (a, b) =>
          new Date(b.last_touch_at).getTime() -
          new Date(a.last_touch_at).getTime()
      );
    }

    return grouped;
  }, [prospects, optimisticMoves]);

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/hub/pipeline?prospect=${id}`);
    },
    [router]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, prospect: PipelineRow) => {
      const effectiveStage =
        optimisticMoves.get(prospect.id) ?? prospect.status;
      e.dataTransfer.setData("text/prospect-id", prospect.id);
      e.dataTransfer.setData("text/source-stage", effectiveStage);
      e.dataTransfer.setData("text/updated-at", prospect.updated_at);
      e.dataTransfer.effectAllowed = "move";
      setDragSource({ prospectId: prospect.id, stage: effectiveStage });
    },
    [optimisticMoves]
  );

  const handleDragOver = useCallback(
    (_e: React.DragEvent, _stage: PipelineStage) => {
      // Validation display is handled by the column component via isValidDrop prop
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    // Column handles its own local drag-over state
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStage: PipelineStage) => {
      const prospectId = e.dataTransfer.getData("text/prospect-id");
      const sourceStage = e.dataTransfer.getData(
        "text/source-stage"
      ) as PipelineStage;
      const updatedAt = e.dataTransfer.getData("text/updated-at");

      setDragSource(null);

      if (!prospectId || !sourceStage) return;
      if (sourceStage === targetStage) return;

      // Check transition validity
      if (!isValidTransition(sourceStage, targetStage)) {
        showToast(
          `Cannot move from ${STAGE_LABELS[sourceStage]} to ${STAGE_LABELS[targetStage]}`,
          "error"
        );
        return;
      }

      // Optimistic move
      setOptimisticMoves((prev) => {
        const next = new Map(prev);
        next.set(prospectId, targetStage);
        return next;
      });

      // Fire server action
      const result = await onStageChange({
        prospect_id: prospectId,
        new_status: targetStage,
        updated_at: updatedAt,
      });

      if (!result.success) {
        // Snap back
        setOptimisticMoves((prev) => {
          const next = new Map(prev);
          next.delete(prospectId);
          return next;
        });
        showToast(result.error ?? "Failed to update stage.", "error");
      } else {
        // Clear optimistic override so the real data takes over after refresh
        setOptimisticMoves((prev) => {
          const next = new Map(prev);
          next.delete(prospectId);
          return next;
        });
        showToast(
          `Moved to ${STAGE_LABELS[targetStage]}`,
          "success"
        );
        router.refresh();
      }
    },
    [onStageChange, showToast, router]
  );

  // Determine if a drop on a given stage is valid based on current drag source
  const isValidDropForStage = useCallback(
    (stage: PipelineStage): boolean => {
      if (!dragSource) return false;
      if (dragSource.stage === stage) return false;
      return isValidTransition(dragSource.stage, stage);
    },
    [dragSource]
  );

  return (
    <div
      className="grid grid-cols-4 gap-3"
      data-testid="kanban-board"
    >
      {KANBAN_STAGES.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          prospects={columns[stage]}
          isValidDrop={isValidDropForStage(stage)}
          onCardClick={handleCardClick}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
