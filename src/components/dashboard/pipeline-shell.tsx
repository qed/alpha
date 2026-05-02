"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { PipelineStage } from "@/lib/constants/pipeline";
import { PipelineFilters } from "./pipeline-filters";
import { PipelineTable, type PipelineRow } from "./pipeline-table";
import { PipelineEmptyState } from "./pipeline-empty-state";
import { AddProspectModal } from "./add-prospect-modal";
import { KanbanBoard } from "./kanban-board";
import { ToastProvider } from "@/components/ui/toast";
import { updateProspectStatus } from "@/lib/actions/prospects";
import {
  ContactDrawer,
  type SelectedProspectDetail,
} from "./contact-drawer";

const VIEW_PREF_KEY = "pipeline-view-preference";

export type SelectedProspect = SelectedProspectDetail;

interface PipelineShellProps {
  prospects: PipelineRow[];
  neighborhoods: string[];
  selectedProspect: SelectedProspect | null;
}

export function PipelineShell({
  prospects,
  neighborhoods,
  selectedProspect,
}: PipelineShellProps) {
  const searchParams = useSearchParams();
  const prospectParam = searchParams.get("prospect");

  // View toggle (table/kanban), persisted in localStorage
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_PREF_KEY);
    if (saved === "kanban" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  function handleViewChange(mode: "table" | "kanban") {
    setViewMode(mode);
    localStorage.setItem(VIEW_PREF_KEY, mode);
  }

  // Filter state
  const [stageFilter, setStageFilter] = useState<PipelineStage | null>(null);
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string | null>(
    null
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const clearFilters = useCallback(() => {
    setStageFilter(null);
    setNeighborhoodFilter(null);
  }, []);

  // Apply filters
  const filteredProspects = useMemo(() => {
    let result = prospects;
    if (stageFilter) {
      result = result.filter((p) => p.status === stageFilter);
    }
    if (neighborhoodFilter) {
      result = result.filter(
        (p) =>
          p.neighborhood?.toLowerCase() === neighborhoodFilter.toLowerCase()
      );
    }
    return result;
  }, [prospects, stageFilter, neighborhoodFilter]);

  // Wrap the updateProspectStatus server action for use by KanbanBoard
  const handleStageChange = useCallback(
    async (data: {
      prospect_id: string;
      new_status: PipelineStage;
      updated_at: string;
    }) => {
      return updateProspectStatus(data);
    },
    []
  );

  // Zero prospects total
  if (prospects.length === 0) {
    return (
      <ToastProvider>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              Pipeline
            </h1>
          </div>
          <PipelineEmptyState onAddProspect={() => setModalOpen(true)} />
        </div>
        <AddProspectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          neighborhoods={neighborhoods}
        />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Pipeline
          </h1>
          <div className="flex items-center gap-3">
            {/* View toggle - hidden on mobile */}
            <div className="hidden md:flex items-center border border-line rounded-sm overflow-hidden">
              <button
                type="button"
                onClick={() => handleViewChange("table")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-alpha-blue text-white"
                    : "bg-paper text-ink-3 hover:bg-paper-2"
                }`}
                aria-label="Table view"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("kanban")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "kanban"
                    ? "bg-alpha-blue text-white"
                    : "bg-paper text-ink-3 hover:bg-paper-2"
                }`}
                aria-label="Kanban view"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
                  />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 text-sm font-medium bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600"
            >
              + Add Prospect
            </button>
          </div>
        </div>

        {/* Filters */}
        <PipelineFilters
          allProspects={prospects}
          stageFilter={stageFilter}
          neighborhoodFilter={neighborhoodFilter}
          neighborhoods={neighborhoods}
          onStageFilterChange={setStageFilter}
          onNeighborhoodFilterChange={setNeighborhoodFilter}
        />

        {/* Table or Kanban */}
        {viewMode === "table" ? (
          <PipelineTable
            prospects={filteredProspects}
            onClearFilters={clearFilters}
          />
        ) : (
          <KanbanBoard
            prospects={filteredProspects}
            onStageChange={handleStageChange}
          />
        )}
      </div>

      {/* Contact Drawer */}
      {prospectParam && selectedProspect && (
        <ContactDrawer prospect={selectedProspect} />
      )}

      {/* Add Prospect Modal */}
      <AddProspectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        neighborhoods={neighborhoods}
      />
    </ToastProvider>
  );
}
