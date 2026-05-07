interface KpiStripProps {
  deposits: number;
  depositTarget: number;
  depositDelta: number;
  activePipeline: number;
  interestedCount: number;
  shadowDayCount: number;
  totalContacts: number;
  streak: number;
}

export function KpiStrip({
  deposits,
  depositTarget,
  depositDelta,
  activePipeline,
  interestedCount,
  shadowDayCount,
  totalContacts,
  streak,
}: KpiStripProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-7" role="list" aria-label="Key metrics">
      {/* Deposits — featured card */}
      <div
        className="bg-alpha-blue text-white border border-alpha-blue rounded-md p-[18px_20px]"
        role="listitem"
      >
        <div className="font-[family-name:var(--font-display)] font-bold text-[11px] tracking-[0.14em] uppercase text-alpha-sky mb-2">
          Deposits
        </div>
        <div className="font-[family-name:var(--font-display)] font-extrabold text-4xl tracking-tight leading-none text-white">
          {deposits}
          <span className="font-[family-name:var(--font-editorial)] italic font-normal text-alpha-sky text-[22px] tracking-tight ml-1">
            /{depositTarget}
          </span>
        </div>
        <div className="text-xs text-alpha-sky mt-1.5 tracking-wide">
          <span className="text-white font-bold">+{depositDelta}</span> in the
          last 14 days
        </div>
      </div>

      {/* Active Pipeline */}
      <div
        className="bg-paper border border-line rounded-md p-[18px_20px]"
        role="listitem"
      >
        <div className="font-[family-name:var(--font-display)] font-bold text-[11px] tracking-[0.14em] uppercase text-ink-4 mb-2">
          Active Pipeline
        </div>
        <div className="font-[family-name:var(--font-display)] font-extrabold text-4xl tracking-tight leading-none text-ink">
          {activePipeline}
        </div>
        <div className="text-xs text-ink-3 mt-1.5 tracking-wide">
          {interestedCount} interested · {shadowDayCount} shadow day
        </div>
      </div>

      {/* Total Contacts */}
      <div
        className="bg-paper border border-line rounded-md p-[18px_20px]"
        role="listitem"
      >
        <div className="font-[family-name:var(--font-display)] font-bold text-[11px] tracking-[0.14em] uppercase text-ink-4 mb-2">
          Total Contacts
        </div>
        <div className="font-[family-name:var(--font-display)] font-extrabold text-4xl tracking-tight leading-none text-ink">
          {totalContacts}
        </div>
        <div className="text-xs text-ink-3 mt-1.5 tracking-wide">
          All children in pipeline
        </div>
      </div>

      {/* Streak */}
      <div
        className="bg-paper border border-line rounded-md p-[18px_20px]"
        role="listitem"
      >
        <div className="font-[family-name:var(--font-display)] font-bold text-[11px] tracking-[0.14em] uppercase text-ink-4 mb-2">
          Streak
        </div>
        <div className="font-[family-name:var(--font-display)] font-extrabold text-4xl tracking-tight leading-none text-ink">
          {streak}
          <span className="font-[family-name:var(--font-editorial)] italic font-normal text-ink-4 text-[22px] tracking-tight ml-1">
            d
          </span>
        </div>
        <div className="text-xs text-ink-3 mt-1.5 tracking-wide">
          Days with at least one logged action
        </div>
      </div>
    </div>
  );
}
