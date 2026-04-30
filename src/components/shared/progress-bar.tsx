import { ENROLLMENT_THRESHOLD } from "@/lib/constants/pipeline";

interface ProgressBarProps {
  count: number;
  threshold?: number;
  className?: string;
}

export function ProgressBar({
  count,
  threshold = ENROLLMENT_THRESHOLD,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((count / threshold) * 100), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-ink-3">
          {count} / {threshold}
        </span>
        <span className="text-sm font-medium text-ink-3">{percentage}%</span>
      </div>
      <div className="w-full h-3 bg-line-2 rounded-pill overflow-hidden">
        <div
          className="h-full rounded-pill transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor:
              percentage >= 100
                ? "var(--color-success)"
                : "var(--color-alpha-blue)",
          }}
        />
      </div>
    </div>
  );
}
