"use client";

interface PipelineEmptyStateProps {
  onAddProspect: () => void;
}

export function PipelineEmptyState({ onAddProspect }: PipelineEmptyStateProps) {
  return (
    <div className="bg-paper rounded-md border border-line p-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-alpha-blue/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-alpha-blue"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-2">
        Add your first prospect
      </h2>
      <p className="text-ink-3 mb-6 max-w-md mx-auto">
        Start building your enrollment pipeline by adding families you are
        working with.
      </p>
      <button
        type="button"
        onClick={onAddProspect}
        className="px-6 py-2 text-sm font-semibold bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600"
      >
        + Add Prospect
      </button>
    </div>
  );
}

interface PipelineFilteredEmptyStateProps {
  onClearFilters: () => void;
}

export function PipelineFilteredEmptyState({
  onClearFilters,
}: PipelineFilteredEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-ink-3 text-sm mb-3">
        No prospects match these filters.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="text-sm text-alpha-blue hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}
