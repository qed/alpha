import { requireAuthenticated } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/constants/pipeline";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import {
  ActivityFeed,
  type ActivityItem,
} from "@/components/dashboard/activity-feed";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { GeographyPicker } from "@/components/dashboard/geography-picker";
import { getAvailableGeographies } from "@/lib/queries/geographies";

export default async function ChampionDashboardPage() {
  const session = await requireAuthenticated();

  if (!session.geographyId) {
    const geographies = await getAvailableGeographies();
    return <GeographyPicker geographies={geographies} />;
  }

  const supabase = getSupabaseAdminClient();

  const { data: geography } = await supabase
    .from("geographies")
    .select("slug, name")
    .eq("id", session.geographyId)
    .single();

  if (!geography) {
    return (
      <div className="text-center py-12 text-ink-3">
        Geography not found. Please contact an administrator.
      </div>
    );
  }

  const { data: childCounts } = await supabase
    .from("children")
    .select("id, prospects!inner(status)")
    .eq("geography_id", session.geographyId);

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

  const enrolledCount = counts.committed + counts.enrolled;
  const totalProspects = Object.values(counts).reduce((a, b) => a + b, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: activityRows } = await supabase
    .from("audit_log")
    .select("id, action, created_at, metadata, prospect_id")
    .eq("geography_id", session.geographyId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(100);

  let activityItems: ActivityItem[] = [];
  if (activityRows && activityRows.length > 0) {
    const prospectIds = [
      ...new Set(
        activityRows
          .map((r) => r.prospect_id)
          .filter((id): id is string => id !== null)
      ),
    ];

    let prospectNames: Record<string, string> = {};
    if (prospectIds.length > 0) {
      const { data: prospects } = await supabase
        .from("prospects")
        .select("id, parent_first, parent_last")
        .in("id", prospectIds);

      if (prospects) {
        prospectNames = Object.fromEntries(
          prospects.map((p) => [p.id, `${p.parent_first} ${p.parent_last}`])
        );
      }
    }

    activityItems = activityRows.map((row) => ({
      id: row.id,
      action: row.action,
      created_at: row.created_at,
      metadata: row.metadata as Record<string, unknown> | null,
      prospect_name: row.prospect_id
        ? prospectNames[row.prospect_id]
        : undefined,
    }));
  }

  const isEmpty = totalProspects === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            {geography.name}
          </h1>
          <p className="text-sm text-ink-3 mt-1">Champion Dashboard</p>
        </div>
        <CopyLinkButton geographySlug={geography.slug} />
      </div>

      {isEmpty ? (
        <EmptyState
          geographySlug={geography.slug}
          geographyName={geography.name}
        />
      ) : (
        <>
          <PipelineSummary childCounts={counts} enrolledCount={enrolledCount} />
          <ActivityFeed items={activityItems} />
        </>
      )}
    </div>
  );
}
