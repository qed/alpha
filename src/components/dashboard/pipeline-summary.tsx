import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import {
  PIPELINE_STAGES,
  STAGE_LABELS,
  type PipelineStage,
} from "@/lib/constants/pipeline";

interface PipelineSummaryProps {
  childCounts: Record<PipelineStage, number>;
  enrolledCount: number;
}

export function PipelineSummary({
  childCounts,
  enrolledCount,
}: PipelineSummaryProps) {
  return (
    <div className="bg-paper rounded-md border border-line p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink mb-4">
        Pipeline
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage} className="text-center">
            <div className="text-2xl font-bold text-ink mb-1">
              {childCounts[stage]}
            </div>
            <StatusBadge stage={stage} />
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-medium text-ink-3 mb-2">
          Enrollment Progress
        </h3>
        <ProgressBar count={enrolledCount} />
      </div>
    </div>
  );
}
