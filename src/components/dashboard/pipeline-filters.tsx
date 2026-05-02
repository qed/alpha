"use client";

import {
  PIPELINE_STAGES,
  STAGE_LABELS,
  STAGE_COLORS,
  type PipelineStage,
} from "@/lib/constants/pipeline";

interface PipelineFiltersProps {
  /** All prospects (unfiltered) for computing cross-filter counts */
  allProspects: { status: PipelineStage; neighborhood: string | null }[];
  stageFilter: PipelineStage | null;
  neighborhoodFilter: string | null;
  neighborhoods: string[];
  onStageFilterChange: (stage: PipelineStage | null) => void;
  onNeighborhoodFilterChange: (neighborhood: string | null) => void;
}

export function PipelineFilters({
  allProspects,
  stageFilter,
  neighborhoodFilter,
  neighborhoods,
  onStageFilterChange,
  onNeighborhoodFilterChange,
}: PipelineFiltersProps) {
  // For stage pill counts: filter only by neighborhood (so you see what
  // selecting each stage would give you within the active neighborhood).
  const neighborhoodFiltered = neighborhoodFilter
    ? allProspects.filter(
        (p) =>
          p.neighborhood?.toLowerCase() === neighborhoodFilter.toLowerCase()
      )
    : allProspects;

  const stageCounts: Record<string, number> = {};
  for (const p of neighborhoodFiltered) {
    stageCounts[p.status] = (stageCounts[p.status] || 0) + 1;
  }

  // For neighborhood pill counts: filter only by stage (so you see what
  // selecting each neighborhood would give you within the active stage).
  const stageFiltered = stageFilter
    ? allProspects.filter((p) => p.status === stageFilter)
    : allProspects;

  const neighborhoodCounts: Record<string, number> = {};
  for (const p of stageFiltered) {
    if (p.neighborhood) {
      const key = p.neighborhood.toLowerCase();
      neighborhoodCounts[key] = (neighborhoodCounts[key] || 0) + 1;
    }
  }

  return (
    <div className="space-y-3">
      {/* Stage filter pills */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider mr-1">
          Stage
        </span>
        <button
          type="button"
          onClick={() => onStageFilterChange(null)}
          className={`px-2.5 py-1 text-xs rounded-pill border transition-colors ${
            stageFilter === null
              ? "bg-alpha-blue text-white border-alpha-blue"
              : "bg-paper text-ink-3 border-line hover:border-ink-3"
          }`}
        >
          All
          <span className="ml-1 opacity-70">{neighborhoodFiltered.length}</span>
        </button>
        {PIPELINE_STAGES.map((stage) => {
          const count = stageCounts[stage] || 0;
          const colors = STAGE_COLORS[stage];
          const isActive = stageFilter === stage;
          return (
            <button
              key={stage}
              type="button"
              onClick={() =>
                onStageFilterChange(isActive ? null : stage)
              }
              className={`px-2.5 py-1 text-xs rounded-pill border transition-colors ${
                isActive
                  ? `${colors.bg} ${colors.text} border-transparent`
                  : "bg-paper text-ink-3 border-line hover:border-ink-3"
              }`}
            >
              {STAGE_LABELS[stage]}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Neighborhood filter pills */}
      {neighborhoods.length > 0 && (
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider mr-1">
            Area
          </span>
          <button
            type="button"
            onClick={() => onNeighborhoodFilterChange(null)}
            className={`px-2.5 py-1 text-xs rounded-pill border transition-colors ${
              neighborhoodFilter === null
                ? "bg-alpha-blue text-white border-alpha-blue"
                : "bg-paper text-ink-3 border-line hover:border-ink-3"
            }`}
          >
            All
          </button>
          {neighborhoods.map((hood) => {
            const count = neighborhoodCounts[hood.toLowerCase()] || 0;
            const isActive =
              neighborhoodFilter?.toLowerCase() === hood.toLowerCase();
            return (
              <button
                key={hood}
                type="button"
                onClick={() =>
                  onNeighborhoodFilterChange(isActive ? null : hood)
                }
                className={`px-2.5 py-1 text-xs rounded-pill border transition-colors ${
                  isActive
                    ? "bg-ink text-white border-ink"
                    : "bg-paper text-ink-3 border-line hover:border-ink-3"
                }`}
              >
                {hood}
                {count > 0 && (
                  <span className="ml-1 opacity-70">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
