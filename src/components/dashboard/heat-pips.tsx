"use client";

interface HeatPipsProps {
  score: number;
  suggestedScore?: number;
  onOverride?: (newScore: number) => void;
  size?: "sm" | "md";
}

export function HeatPips({
  score,
  suggestedScore,
  onOverride,
  size = "md",
}: HeatPipsProps) {
  const pipSize = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  const gap = size === "sm" ? "gap-1" : "gap-1.5";

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex ${gap}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOverride?.(i)}
            disabled={!onOverride}
            className={`${pipSize} rounded-full transition-colors ${
              i <= score
                ? "bg-alpha-coral"
                : "bg-line"
            } ${onOverride ? "cursor-pointer hover:bg-alpha-coral/60" : "cursor-default"}`}
            aria-label={`Set heat to ${i}`}
          />
        ))}
      </span>

      {/* Show auto-suggested value if different from current */}
      {suggestedScore !== undefined && suggestedScore !== score && (
        <span className="text-[10px] text-ink-4">
          auto: {suggestedScore}
        </span>
      )}
    </div>
  );
}
