import Link from "next/link";
import { requireAuthenticated } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ProspectTable,
  type ProspectRow,
} from "@/components/dashboard/prospect-table";
import type { PipelineStage } from "@/lib/constants/pipeline";
import { GeographyPicker } from "@/components/dashboard/geography-picker";
import { getAvailableGeographies } from "@/lib/queries/geographies";

export default async function ProspectsPage() {
  const session = await requireAuthenticated();

  if (!session.geographyId) {
    const geographies = await getAvailableGeographies();
    return <GeographyPicker geographies={geographies} />;
  }

  const supabase = await getSupabaseServerClient();

  const { data: prospects } = await supabase
    .from("prospects")
    .select("id, parent_first, parent_last, parent_email, status, follow_up_date, created_at, children(id)")
    .eq("geography_id", session.geographyId)
    .order("created_at", { ascending: false });

  const rows: ProspectRow[] = (prospects || []).map((p) => ({
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
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Prospects
        </h1>
        <Link
          href="/hub/prospects/new"
          className="px-4 py-2 text-sm font-medium bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600 no-underline"
        >
          + Add Prospect
        </Link>
      </div>
      <ProspectTable prospects={rows} />
    </div>
  );
}
