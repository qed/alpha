"use client";

export interface WeeklyStats {
  oneOnOneConversations: number;
  librarySends: number;
  stageChanges: number;
  newContacts: number;
}

interface ThisWeekStatsProps {
  stats: WeeklyStats;
}

const STAT_ROWS: { key: keyof WeeklyStats; label: string }[] = [
  { key: "oneOnOneConversations", label: "1:1 conversations logged" },
  { key: "librarySends", label: "Library sends" },
  { key: "stageChanges", label: "Stage changes" },
  { key: "newContacts", label: "New contacts added" },
];

export function ThisWeekStats({ stats }: ThisWeekStatsProps) {
  return (
    <div className="bg-paper border border-line rounded-md overflow-hidden">
      <div className="px-5 py-3.5 border-b border-line flex items-center gap-3">
        <h3 className="font-[family-name:var(--font-display)] font-extrabold text-base tracking-tight m-0">
          This week
        </h3>
      </div>
      <div className="px-6 py-4">
        {STAT_ROWS.map((row, i) => (
          <div
            key={row.key}
            className={`flex justify-between py-2.5 ${
              i < STAT_ROWS.length - 1 ? "border-b border-line-2" : ""
            }`}
          >
            <span className="text-[13px] text-ink-3">{row.label}</span>
            <span className="font-[family-name:var(--font-display)] font-bold text-ink">
              {stats[row.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
