"use client";

import { ProgressBar } from "@/components/shared/progress-bar";

interface DepositThermometerProps {
  deposits: number;
  threshold: number;
  geographyName: string;
}

export function DepositThermometer({
  deposits,
  threshold,
  geographyName,
}: DepositThermometerProps) {
  const remaining = Math.max(threshold - deposits, 0);
  const percentage = Math.min(
    Math.round((deposits / threshold) * 100),
    100
  );

  // Generate tick values: 0, 5, 10, ... up to threshold
  const ticks: (number | string)[] = [];
  const step = 5;
  for (let i = 0; i < threshold; i += step) {
    ticks.push(i);
  }
  ticks.push(`${threshold} · open`);

  return (
    <div className="bg-paper border border-line rounded-lg p-7 mb-7 relative overflow-hidden">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="font-[family-name:var(--font-display)] font-bold text-[11px] tracking-[0.14em] uppercase text-ink-4 mb-1.5">
            {geographyName}
          </div>
          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[28px] tracking-tight m-0">
            Toward{" "}
            <span className="font-[family-name:var(--font-editorial)] italic font-normal text-alpha-blue">
              opening day.
            </span>
          </h2>
        </div>
        <div className="text-right">
          <div className="font-[family-name:var(--font-display)] font-extrabold text-[56px] tracking-tighter leading-[0.92] text-ink">
            {deposits}
            <span className="font-[family-name:var(--font-editorial)] italic font-normal text-[32px] text-ink-4 tracking-tight">
              /{threshold}
            </span>
          </div>
          <div className="text-xs text-ink-3 tracking-widest uppercase font-semibold mt-1">
            Deposits · {remaining} to go
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[18px] bg-paper-3 rounded-pill overflow-hidden relative">
        <div
          className="h-full rounded-pill relative"
          style={{
            width: `${percentage}%`,
            background:
              "linear-gradient(90deg, var(--color-alpha-blue), var(--color-alpha-blue-600))",
            transition: "width 600ms ease-out",
          }}
          role="progressbar"
          aria-valuenow={deposits}
          aria-valuemin={0}
          aria-valuemax={threshold}
          aria-label={`${deposits} of ${threshold} deposits`}
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-2.5 font-[family-name:var(--font-display)] text-[10px] font-bold tracking-[0.12em] text-ink-4 uppercase">
        {ticks.map((tick, i) => (
          <span key={i}>{tick}</span>
        ))}
      </div>
    </div>
  );
}
