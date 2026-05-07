"use client";

import Link from "next/link";
import { HeatPips } from "@/components/dashboard/heat-pips";
import { StatusBadge } from "@/components/shared/status-badge";
import type { PipelineStage } from "@/lib/constants/pipeline";

export interface BriefingProspect {
  id: string;
  parent_first: string;
  parent_last: string;
  heat_score: number;
  days_since_touch: number;
  stage: PipelineStage;
}

export interface CoolingProspect {
  id: string;
  parent_first: string;
  parent_last: string;
  days_since_touch: number;
}

export interface WarmingProspect {
  id: string;
  parent_first: string;
  parent_last: string;
  stage: PipelineStage;
}

interface TodaysBriefingProps {
  followUps: BriefingProspect[];
  coolingOff: CoolingProspect[];
  warmingUp: WarmingProspect[];
}

function formatDateHeader(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getInitials(first: string, last: string): string {
  return `${(first?.[0] ?? "").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`;
}

export function TodaysBriefing({
  followUps,
  coolingOff,
  warmingUp,
}: TodaysBriefingProps) {
  const dateStr = formatDateHeader();

  return (
    <div className="bg-paper border border-line rounded-lg overflow-hidden mb-5">
      {/* Header */}
      <div className="bg-paper-3 px-6 py-[18px] border-b border-line flex items-center gap-3.5">
        <div>
          <div className="font-[family-name:var(--font-display)] font-extrabold text-sm tracking-tight text-ink">
            {dateStr} · Today&apos;s Briefing
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-2">
        {/* Column 1: Follow-ups */}
        <div className="p-5 px-6 border-r border-line">
          <h5 className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.16em] uppercase text-ink-4 m-0 mb-3">
            {followUps.length > 0
              ? `${followUps.length} Follow-up${followUps.length !== 1 ? "s" : ""}`
              : "Follow-ups"}
          </h5>
          {followUps.length === 0 ? (
            <p className="text-sm text-ink-4">Nothing yet</p>
          ) : (
            followUps.map((prospect) => (
              <Link
                key={prospect.id}
                href={`/hub/pipeline?prospect=${prospect.id}`}
                className="flex gap-2.5 items-start py-2 border-b border-line-2 last:border-b-0 no-underline text-inherit hover:bg-paper-2 -mx-2 px-2 rounded-sm transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-alpha-sky text-alpha-blue-ink flex items-center justify-center font-[family-name:var(--font-display)] font-extrabold text-[11px] shrink-0">
                  {getInitials(prospect.parent_first, prospect.parent_last)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-[family-name:var(--font-display)] font-bold text-[13px] tracking-tight">
                    {prospect.parent_first} {prospect.parent_last}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <HeatPips score={prospect.heat_score} size="sm" />
                    <span className="text-[11px] text-ink-4">
                      {prospect.days_since_touch}d since touch
                    </span>
                    <StatusBadge stage={prospect.stage} className="text-[9px] py-0.5 px-2" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Column 2: Watch */}
        <div className="p-5 px-6">
          <h5 className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.16em] uppercase text-ink-4 m-0 mb-3">
            Watch
          </h5>

          {/* Cooling off */}
          {coolingOff.length === 0 && warmingUp.length === 0 ? (
            <p className="text-sm text-ink-4">Nothing yet</p>
          ) : (
            <>
              {coolingOff.map((prospect) => (
                <div
                  key={prospect.id}
                  className="flex gap-2.5 items-start py-2 border-b border-line-2 last:border-b-0"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FFE4B0] text-[#6A4A00] flex items-center justify-center font-[family-name:var(--font-display)] font-extrabold text-[11px] shrink-0">
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-[family-name:var(--font-display)] font-bold text-[13px] tracking-tight">
                      {prospect.parent_first} {prospect.parent_last} cooling off
                    </div>
                    <div className="text-[11px] text-ink-4 mt-0.5">
                      {prospect.days_since_touch} days since touch, no signals.
                    </div>
                  </div>
                </div>
              ))}

              {warmingUp.map((prospect) => (
                <div
                  key={prospect.id}
                  className="flex gap-2.5 items-start py-2 border-b border-line-2 last:border-b-0"
                >
                  <div className="w-7 h-7 rounded-full bg-[#DCFCE7] text-[#065F36] flex items-center justify-center font-[family-name:var(--font-display)] font-extrabold text-[11px] shrink-0">
                    ↑
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-[family-name:var(--font-display)] font-bold text-[13px] tracking-tight">
                      {prospect.parent_first} {prospect.parent_last} warming up
                    </div>
                    <div className="text-[11px] text-ink-4 mt-0.5">
                      Recent 1:1 signal. Consider stage advance.
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
