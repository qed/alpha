import { requireAuthenticated } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { GeographyPicker } from "@/components/dashboard/geography-picker";
import { getAvailableGeographies } from "@/lib/queries/geographies";
import {
  PipelineShell,
  type SelectedProspect,
} from "@/components/dashboard/pipeline-shell";
import type { PipelineRow } from "@/components/dashboard/pipeline-table";
import type { PipelineStage } from "@/lib/constants/pipeline";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await requireAuthenticated();

  if (!session.geographyId) {
    const geographies = await getAvailableGeographies();
    return <GeographyPicker geographies={geographies} />;
  }

  const supabase = getSupabaseAdminClient();

  // Fetch all prospects for geography
  const { data: prospects } = await supabase
    .from("prospects")
    .select(
      "id, parent_first, parent_last, parent_email, parent_phone, spouse_name, source, status, heat_score, concerns, engagement_signals, last_touch_at, neighborhood, follow_up_date, first_responded_at, consent_given, consent_at, created_at, updated_at, children(id)"
    )
    .eq("geography_id", session.geographyId)
    .order("created_at", { ascending: false });

  const rows: PipelineRow[] = (prospects || []).map((p) => ({
    id: p.id,
    parent_first: p.parent_first,
    parent_last: p.parent_last,
    parent_email: p.parent_email,
    parent_phone: p.parent_phone,
    spouse_name: p.spouse_name,
    source: p.source,
    status: p.status as PipelineStage,
    heat_score: p.heat_score ?? 3,
    concerns: (p.concerns as string[]) ?? [],
    engagement_signals: (p.engagement_signals as string[]) ?? [],
    last_touch_at: p.last_touch_at ?? p.created_at,
    neighborhood: p.neighborhood ?? null,
    follow_up_date: p.follow_up_date,
    first_responded_at: p.first_responded_at,
    consent_given: p.consent_given,
    consent_at: p.consent_at,
    created_at: p.created_at,
    updated_at: p.updated_at,
    child_count: Array.isArray(p.children) ? p.children.length : 0,
  }));

  // Extract distinct neighborhoods (case-insensitive dedup)
  const neighborhoodSet = new Map<string, string>();
  for (const p of rows) {
    if (p.neighborhood) {
      const key = p.neighborhood.toLowerCase();
      if (!neighborhoodSet.has(key)) {
        neighborhoodSet.set(key, p.neighborhood);
      }
    }
  }
  const neighborhoods = Array.from(neighborhoodSet.values()).sort();

  // If ?prospect={id} is present, fetch full prospect detail for the drawer
  const resolvedParams = await searchParams;
  const prospectId =
    typeof resolvedParams.prospect === "string"
      ? resolvedParams.prospect
      : undefined;

  let selectedProspect: SelectedProspect | null = null;

  if (prospectId) {
    const { data: detail } = await supabase
      .from("prospects")
      .select(
        "id, parent_first, parent_last, parent_email, parent_phone, spouse_name, source, status, heat_score, concerns, engagement_signals, last_touch_at, neighborhood, follow_up_date, first_responded_at, consent_given, consent_at, created_at, updated_at"
      )
      .eq("id", prospectId)
      .eq("geography_id", session.geographyId)
      .single();

    if (detail) {
      const [
        { data: children },
        { data: notes },
        { data: statusHistory },
        { data: auditEntries },
        { data: librarySends },
      ] = await Promise.all([
        supabase
          .from("children")
          .select("id, first_name, grade, age, gender")
          .eq("prospect_id", prospectId),
        supabase
          .from("notes")
          .select("id, body, author_id, created_at")
          .eq("prospect_id", prospectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("status_history")
          .select("id, old_status, new_status, changed_by, changed_at")
          .eq("prospect_id", prospectId)
          .order("changed_at", { ascending: false }),
        supabase
          .from("audit_log")
          .select("id, action, metadata, created_at, actor_id")
          .eq("prospect_id", prospectId)
          .in("action", ["signal-toggle", "concern-update", "heat-override"])
          .order("created_at", { ascending: false }),
        supabase
          .from("library_sends")
          .select("id, library_item_id, channel, sent_at")
          .eq("prospect_id", prospectId)
          .order("sent_at", { ascending: false }),
      ]);

      selectedProspect = {
        ...detail,
        status: detail.status as PipelineStage,
        concerns: (detail.concerns as string[]) ?? [],
        engagement_signals: (detail.engagement_signals as string[]) ?? [],
        last_touch_at: detail.last_touch_at ?? detail.created_at,
        heat_score: detail.heat_score ?? 3,
        children: children ?? [],
        notes: notes ?? [],
        statusHistory: statusHistory ?? [],
        auditEntries: auditEntries ?? [],
        librarySends: librarySends ?? [],
      } as SelectedProspect;
    }
  }

  return (
    <PipelineShell
      prospects={rows}
      neighborhoods={neighborhoods}
      selectedProspect={selectedProspect}
    />
  );
}
