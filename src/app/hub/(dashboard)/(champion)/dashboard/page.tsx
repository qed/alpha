import { requireAuthenticated } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ENROLLMENT_THRESHOLD,
  type PipelineStage,
} from "@/lib/constants/pipeline";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { DepositThermometer } from "@/components/dashboard/deposit-thermometer";
import { TodaysBriefing } from "@/components/dashboard/todays-briefing";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { ThisWeekStats } from "@/components/dashboard/this-week-stats";
import {
  computeStreak,
  buildFollowUps,
  buildCoolingOff,
  buildWarmingUp,
  buildWeeklyStats,
} from "@/lib/utils/dashboard";

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

  // ---------- Derived data ----------
  const streak = computeStreak(streakRows, now);
  const prospects = (prospectRows ?? []) as {
    id: string;
    parent_first: string;
    parent_last: string;
    status: string;
    heat_score: number | null;
    last_touch_at: string | null;
    created_at: string;
  }[];
  const followUps = buildFollowUps(prospects);
  const coolingOff = buildCoolingOff(prospects);
  const warmingUp = buildWarmingUp(prospects, warmingSignalRows as { prospect_id: string | null; metadata: unknown }[] | null);
  const weekStats = buildWeeklyStats(weekAuditRows as { action: string; metadata: unknown }[] | null);

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
