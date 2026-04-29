import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import {
  ActivityFeed,
  type ActivityItem,
} from "@/components/dashboard/activity-feed";
import {
  ProspectTable,
  type ProspectRow,
} from "@/components/dashboard/prospect-table";
import type { PipelineStage } from "@/lib/constants/pipeline";

interface Props {
  params: Promise<{ geography: string }>;
}

export default async function AdminGeographyDrillDownPage({ params }: Props) {
  const { geography: slug } = await params;
  const session = await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: geography } = await supabase
    .from("geographies")
    .select("id, slug, name, status")
    .eq("slug", slug)
    .single();

  if (!geography) {
    return (
      <div className="text-center py-12 text-ink-3">
        Geography not found.{" "}
        <Link href="/leaderboard" className="text-alpha-blue hover:underline">
          Back to leaderboard
        </Link>
      </div>
    );
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "drill-down",
    geography_id: geography.id,
    metadata: { geography_name: geography.name },
  });

  const { data: childCounts } = await supabase
    .from("children")
    .select("id, prospects!inner(status)")
    .eq("geography_id", geography.id);

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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: activityRows } = await supabase
    .from("audit_log")
    .select("id, action, created_at, metadata, prospect_id")
    .eq("geography_id", geography.id)
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

  const { data: prospects } = await supabase
    .from("prospects")
    .select(
      "id, parent_first, parent_last, parent_email, status, follow_up_date, created_at, children(id)"
    )
    .eq("geography_id", geography.id)
    .order("created_at", { ascending: false });

  const prospectRows: ProspectRow[] = (prospects || []).map((p) => ({
    id: p.id,
    parent_first: p.parent_first,
    parent_last: p.parent_last,
    parent_email: p.parent_email,
    status: p.status as PipelineStage,
    follow_up_date: p.follow_up_date,
    created_at: p.created_at,
    child_count: Array.isArray(p.children) ? p.children.length : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/leaderboard"
          className="text-sm text-alpha-blue hover:underline no-underline"
        >
          ← Leaderboard
        </Link>
        <span className="text-ink-3">/</span>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          {geography.name}
        </h1>
        <span className="text-xs px-2 py-0.5 bg-ink-3/10 rounded-pill text-ink-3">
          {geography.status}
        </span>
      </div>

      <PipelineSummary childCounts={counts} enrolledCount={enrolledCount} />
      <ActivityFeed items={activityItems} />

      <div className="bg-paper rounded-md border border-line p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink mb-4">
          Prospects
        </h2>
        <ProspectTable prospects={prospectRows} />
      </div>
    </div>
  );
}
