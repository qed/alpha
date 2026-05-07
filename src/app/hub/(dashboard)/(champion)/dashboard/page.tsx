import { requireAuthenticated } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  PIPELINE_STAGES,
  ENROLLMENT_THRESHOLD,
  type PipelineStage,
} from "@/lib/constants/pipeline";
import { daysSince } from "@/lib/utils/dates";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { DepositThermometer } from "@/components/dashboard/deposit-thermometer";
import {
  TodaysBriefing,
  type BriefingProspect,
  type CoolingProspect,
  type WarmingProspect,
} from "@/components/dashboard/todays-briefing";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import {
  ThisWeekStats,
  type WeeklyStats,
} from "@/components/dashboard/this-week-stats";

export default async function ChampionDashboardPage() {
  const session = await requireAuthenticated();
  const supabase = getSupabaseAdminClient();

  // ---------- Date boundaries ----------
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Monday of current week (for this-week stats)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  // ---------- Parallel data fetch ----------
  const [
    { data: geography },
    { data: childCounts },
    { data: depositDeltaRows },
    { data: streakRows },
    { data: prospectRows },
    { data: warmingSignalRows },
    { data: weekAuditRows },
  ] = await Promise.all([
    // 1. Geography details with enrollment_threshold
    supabase
      .from("geographies")
      .select("slug, name, enrollment_threshold")
      .eq("id", session.geographyId)
      .single(),

    // 2. Child counts by stage
    supabase
      .from("children")
      .select("id, prospects!inner(status)")
      .eq("geography_id", session.geographyId),

    // 3. Status history for 14-day deposit delta
    supabase
      .from("status_history")
      .select("id")
      .eq("geography_id", session.geographyId)
      .gte("changed_at", fourteenDaysAgo.toISOString())
      .in("new_status", ["committed", "enrolled"])
      .not("old_status", "in", '("committed","enrolled")'),

    // 4. Distinct audit_log dates for streak (90 days)
    supabase
      .from("audit_log")
      .select("created_at")
      .eq("geography_id", session.geographyId)
      .gte("created_at", ninetyDaysAgo.toISOString())
      .order("created_at", { ascending: false }),

    // 5. Prospects with briefing data
    supabase
      .from("prospects")
      .select(
        "id, parent_first, parent_last, status, heat_score, last_touch_at, created_at"
      )
      .eq("geography_id", session.geographyId),

    // 6. Warming-up: signal-toggle within 7 days
    supabase
      .from("audit_log")
      .select("prospect_id, metadata")
      .eq("geography_id", session.geographyId)
      .eq("action", "signal-toggle")
      .gte("created_at", sevenDaysAgo.toISOString()),

    // 7. This-week audit_log
    supabase
      .from("audit_log")
      .select("action, metadata")
      .eq("geography_id", session.geographyId)
      .gte("created_at", startOfWeek.toISOString()),
  ]);

  if (!geography) {
    return (
      <div className="text-center py-12 text-ink-3">
        Geography not found. Please contact an administrator.
      </div>
    );
  }

  // ---------- Compute child counts by stage ----------
  const counts: Record<PipelineStage, number> = {
    interested: 0,
    "shadow-day": 0,
    committed: 0,
    enrolled: 0,
    lost: 0,
  };

  if (childCounts) {
    for (const row of childCounts) {
      const status = (row.prospects as unknown as { status: PipelineStage })
        .status;
      if (status in counts) {
        counts[status]++;
      }
    }
  }

  const deposits = counts.committed + counts.enrolled;
  const activePipeline = counts.interested + counts["shadow-day"];
  const totalContacts = Object.values(counts).reduce((a, b) => a + b, 0);
  const enrollmentThreshold =
    (geography as Record<string, unknown>).enrollment_threshold != null
      ? Number((geography as Record<string, unknown>).enrollment_threshold)
      : ENROLLMENT_THRESHOLD;

  // ---------- 14-day deposit delta ----------
  const depositDelta = depositDeltaRows?.length ?? 0;

  // ---------- Streak calculation ----------
  function computeStreak(
    rows: { created_at: string }[] | null
  ): number {
    if (!rows || rows.length === 0) return 0;

    // Extract distinct dates (YYYY-MM-DD) and sort descending
    const dateSet = new Set<string>();
    for (const row of rows) {
      const d = new Date(row.created_at);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dateSet.add(dateStr);
    }

    const sortedDates = [...dateSet].sort().reverse();
    if (sortedDates.length === 0) return 0;

    // Check if today is in the streak
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    let streak = 0;
    let expectedDate = new Date(now);

    // If today has no action, start from yesterday
    if (sortedDates[0] !== todayStr) {
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    for (const dateStr of sortedDates) {
      const expected = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDate.getDate()).padStart(2, "0")}`;
      if (dateStr === expected) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (dateStr < expected) {
        // Gap found — streak broken
        break;
      }
      // If dateStr > expected, skip duplicate/future entries
    }

    return streak;
  }

  const streak = computeStreak(streakRows);

  // ---------- Briefing: Follow-ups ----------
  const prospects = prospectRows ?? [];

  const followUpCandidates = prospects
    .filter(
      (p) =>
        p.status !== "committed" &&
        p.status !== "enrolled" &&
        p.status !== "lost"
    )
    .map((p) => {
      const touchDate = p.last_touch_at ?? p.created_at;
      const dSince = daysSince(touchDate);
      const heatScore = p.heat_score ?? 0;
      return {
        id: p.id as string,
        parent_first: p.parent_first as string,
        parent_last: p.parent_last as string,
        heat_score: heatScore as number,
        days_since_touch: dSince,
        stage: p.status as PipelineStage,
        rank: heatScore * 4 + dSince,
      };
    })
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 3);

  const followUps: BriefingProspect[] = followUpCandidates.map(
    ({ rank, ...rest }) => rest
  );

  // ---------- Briefing: Cooling off ----------
  const coolingOff: CoolingProspect[] = prospects
    .filter(
      (p) =>
        p.status !== "committed" &&
        p.status !== "enrolled" &&
        p.status !== "lost"
    )
    .map((p) => {
      const touchDate = p.last_touch_at ?? p.created_at;
      const dSince = daysSince(touchDate);
      const heatScore = p.heat_score ?? 0;
      return {
        id: p.id as string,
        parent_first: p.parent_first as string,
        parent_last: p.parent_last as string,
        days_since_touch: dSince,
        heat_score: heatScore,
      };
    })
    .filter((p) => p.days_since_touch > 14 && p.heat_score <= 3)
    .sort((a, b) => b.days_since_touch - a.days_since_touch)
    .slice(0, 2)
    .map(({ heat_score, ...rest }) => rest);

  // ---------- Briefing: Warming up ----------
  const warmingProspectIds = new Set<string>();
  if (warmingSignalRows) {
    for (const row of warmingSignalRows) {
      const meta = row.metadata as Record<string, unknown> | null;
      if (meta?.active === true || meta?.active === "true") {
        if (row.prospect_id) {
          warmingProspectIds.add(row.prospect_id as string);
        }
      }
    }
  }

  const warmingUp: WarmingProspect[] = prospects
    .filter(
      (p) =>
        warmingProspectIds.has(p.id as string) &&
        (p.status === "interested" || p.status === "shadow-day")
    )
    .slice(0, 2)
    .map((p) => ({
      id: p.id as string,
      parent_first: p.parent_first as string,
      parent_last: p.parent_last as string,
      stage: p.status as PipelineStage,
    }));

  // ---------- This-week stats ----------
  const weekStats: WeeklyStats = {
    oneOnOneConversations: 0,
    librarySends: 0,
    stageChanges: 0,
    newContacts: 0,
  };

  if (weekAuditRows) {
    for (const row of weekAuditRows) {
      const action = row.action as string;
      const meta = row.metadata as Record<string, unknown> | null;

      if (
        action === "signal-toggle" &&
        meta?.signal_id === "1-1" &&
        (meta?.active === true || meta?.active === "true")
      ) {
        weekStats.oneOnOneConversations++;
      } else if (action === "library-send") {
        weekStats.librarySends++;
      } else if (action === "status-change") {
        weekStats.stageChanges++;
      } else if (action === "prospect-create") {
        weekStats.newContacts++;
      }
    }
  }

  // ---------- Render ----------
  return (
    <div>
      {/* Unit 2: KPI Strip */}
      <KpiStrip
        deposits={deposits}
        depositTarget={enrollmentThreshold}
        depositDelta={depositDelta}
        activePipeline={activePipeline}
        interestedCount={counts.interested}
        shadowDayCount={counts["shadow-day"]}
        totalContacts={totalContacts}
        streak={streak}
      />

      {/* Unit 2: Deposit Thermometer */}
      <DepositThermometer
        deposits={deposits}
        threshold={enrollmentThreshold}
        geographyName={geography.name}
      />

      {/* Unit 3: Today's Briefing */}
      <TodaysBriefing
        followUps={followUps}
        coolingOff={coolingOff}
        warmingUp={warmingUp}
      />

      {/* Unit 3: Two-Column Footer */}
      <div className="grid grid-cols-[2fr_1fr] gap-5 items-start">
        <PipelineSummary childCounts={counts} enrolledCount={deposits} />
        <ThisWeekStats stats={weekStats} />
      </div>
    </div>
  );
}
