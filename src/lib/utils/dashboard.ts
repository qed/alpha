import { daysSince } from "./dates";
import type { PipelineStage } from "@/lib/constants/pipeline";
import type { BriefingProspect, CoolingProspect, WarmingProspect } from "@/components/dashboard/todays-briefing";
import type { WeeklyStats } from "@/components/dashboard/this-week-stats";

interface ProspectRow {
  id: string;
  parent_first: string;
  parent_last: string;
  status: string;
  heat_score: number | null;
  last_touch_at: string | null;
  created_at: string;
}

export function computeStreak(
  rows: { created_at: string }[] | null,
  now: Date = new Date()
): number {
  if (!rows || rows.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const row of rows) {
    const d = new Date(row.created_at);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dateSet.add(dateStr);
  }

  const sortedDates = [...dateSet].sort().reverse();
  if (sortedDates.length === 0) return 0;

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let streak = 0;
  const expectedDate = new Date(now);

  if (sortedDates[0] !== todayStr) {
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  for (const dateStr of sortedDates) {
    const expected = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDate.getDate()).padStart(2, "0")}`;
    if (dateStr === expected) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (dateStr < expected) {
      break;
    }
  }

  return streak;
}

interface EnrichedProspect {
  id: string;
  parent_first: string;
  parent_last: string;
  heat_score: number;
  days_since_touch: number;
  stage: PipelineStage;
}

function getActiveProspects(prospects: ProspectRow[]): EnrichedProspect[] {
  return prospects
    .filter(
      (p) =>
        p.status !== "committed" &&
        p.status !== "enrolled" &&
        p.status !== "lost"
    )
    .map((p) => {
      const touchDate = p.last_touch_at ?? p.created_at;
      return {
        id: p.id,
        parent_first: p.parent_first,
        parent_last: p.parent_last,
        heat_score: p.heat_score ?? 0,
        days_since_touch: daysSince(touchDate),
        stage: p.status as PipelineStage,
      };
    });
}

export function buildFollowUps(prospects: ProspectRow[]): BriefingProspect[] {
  return getActiveProspects(prospects)
    .map((p) => ({ ...p, rank: p.heat_score * 4 + p.days_since_touch }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 3)
    .map(({ rank, ...rest }) => rest);
}

export function buildCoolingOff(prospects: ProspectRow[]): CoolingProspect[] {
  return getActiveProspects(prospects)
    .filter((p) => p.days_since_touch > 14 && p.heat_score <= 3)
    .sort((a, b) => b.days_since_touch - a.days_since_touch)
    .slice(0, 2)
    .map(({ heat_score, stage, ...rest }) => rest);
}

export function buildWarmingUp(
  prospects: ProspectRow[],
  signalRows: { prospect_id: string | null; metadata: unknown }[] | null
): WarmingProspect[] {
  const warmingProspectIds = new Set<string>();
  if (signalRows) {
    for (const row of signalRows) {
      const meta = row.metadata as Record<string, unknown> | null;
      if (meta?.active === true || meta?.active === "true") {
        if (row.prospect_id) {
          warmingProspectIds.add(row.prospect_id);
        }
      }
    }
  }

  return prospects
    .filter(
      (p) =>
        warmingProspectIds.has(p.id) &&
        (p.status === "interested" || p.status === "shadow-day")
    )
    .slice(0, 2)
    .map((p) => ({
      id: p.id,
      parent_first: p.parent_first,
      parent_last: p.parent_last,
      stage: p.status as PipelineStage,
    }));
}

export function buildWeeklyStats(
  auditRows: { action: string; metadata: unknown }[] | null
): WeeklyStats {
  const stats: WeeklyStats = {
    oneOnOneConversations: 0,
    librarySends: 0,
    stageChanges: 0,
    newContacts: 0,
  };

  if (!auditRows) return stats;

  for (const row of auditRows) {
    const meta = row.metadata as Record<string, unknown> | null;

    if (
      row.action === "signal-toggle" &&
      meta?.signal_id === "1-1" &&
      (meta?.active === true || meta?.active === "true")
    ) {
      stats.oneOnOneConversations++;
    } else if (row.action === "library-send") {
      stats.librarySends++;
    } else if (row.action === "status-change") {
      stats.stageChanges++;
    } else if (row.action === "prospect-create") {
      stats.newContacts++;
    }
  }

  return stats;
}
