import Link from "next/link";
import { requireChampion } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ProspectDetail,
  type ProspectDetailData,
} from "@/components/dashboard/prospect-detail";
import type { PipelineStage } from "@/lib/constants/pipeline";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProspectDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireChampion();

  if (!session.geographyId) {
    return (
      <div className="text-center py-16 text-ink-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
          Almost there!
        </h2>
        <p className="text-lg leading-relaxed max-w-md mx-auto">
          Your account is set up, but a geography hasn&rsquo;t been assigned yet.
          Please contact your administrator to get started.
        </p>
      </div>
    );
  }

  const supabase = await getSupabaseServerClient();

  const { data: prospect } = await supabase
    .from("prospects")
    .select(
      "id, parent_first, parent_last, parent_email, parent_phone, spouse_name, source, status, follow_up_date, first_responded_at, created_at, updated_at, geography_id"
    )
    .eq("id", id)
    .single();

  if (!prospect || prospect.geography_id !== session.geographyId) {
    return (
      <div className="text-center py-12 text-ink-3">
        Prospect not found.{" "}
        <Link href="/hub/prospects" className="text-alpha-blue hover:underline">
          Back to prospects
        </Link>
      </div>
    );
  }

  const { data: children } = await supabase
    .from("children")
    .select("id, first_name, grade, age, gender")
    .eq("prospect_id", id);

  const { data: notesRaw } = await supabase
    .from("notes")
    .select("id, body, created_at, author_id")
    .eq("prospect_id", id)
    .order("created_at", { ascending: false });

  let notes: { id: string; body: string; created_at: string; author_name: string }[] = [];
  if (notesRaw && notesRaw.length > 0) {
    const authorIds = [...new Set(notesRaw.map((n) => n.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("clerk_user_id, full_name")
      .in("clerk_user_id", authorIds);

    const nameMap = Object.fromEntries(
      (profiles || []).map((p) => [p.clerk_user_id, p.full_name])
    );

    notes = notesRaw.map((n) => ({
      id: n.id,
      body: n.body,
      created_at: n.created_at,
      author_name: nameMap[n.author_id] || "Unknown",
    }));
  }

  const detailData: ProspectDetailData = {
    id: prospect.id,
    parent_first: prospect.parent_first,
    parent_last: prospect.parent_last,
    parent_email: prospect.parent_email,
    parent_phone: prospect.parent_phone,
    spouse_name: prospect.spouse_name,
    source: prospect.source,
    status: prospect.status as PipelineStage,
    follow_up_date: prospect.follow_up_date,
    first_responded_at: prospect.first_responded_at,
    created_at: prospect.created_at,
    updated_at: prospect.updated_at,
    children: children || [],
    notes,
  };

  return (
    <div className="space-y-4">
      <Link
        href="/hub/prospects"
        className="text-sm text-alpha-blue hover:underline no-underline"
      >
        ← Back to prospects
      </Link>
      <ProspectDetail prospect={detailData} />
    </div>
  );
}
