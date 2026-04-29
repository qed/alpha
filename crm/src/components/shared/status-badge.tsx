import {
  type PipelineStage,
  STAGE_LABELS,
  STAGE_COLORS,
} from "@/lib/constants/pipeline";

interface StatusBadgeProps {
  stage: PipelineStage;
  className?: string;
}

export function StatusBadge({ stage, className = "" }: StatusBadgeProps) {
  const colors = STAGE_COLORS[stage];
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} ${className}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
