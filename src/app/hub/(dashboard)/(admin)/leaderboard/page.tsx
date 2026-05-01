import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  LeaderboardGrid,
  type GeographyCard,
} from "@/components/admin/leaderboard-grid";
import type { PipelineStage } from "@/lib/constants/pipeline";

export default async function AdminLeaderboardPage() {
  await requireAdmin();
  const supabase = getSupabaseAdminClient();

  const { data: geographies } = await supabase
    .from("geographies")
    .select("id, slug, name, status")
    .order("name");

  if (!geographies) {
    return <div className="text-ink-3">Failed to load geographies.</div>;
  }

  const { data: children } = await supabase
    .from("children")
    .select("id, geography_id, prospects!inner(status)");

  const countsByGeo: Record<
    string,
    { enrolled: number; total: number }
  > = {};

  if (children) {
    for (const child of children) {
      const geoId = child.geography_id;
      if (!countsByGeo[geoId]) {
        countsByGeo[geoId] = { enrolled: 0, total: 0 };
      }
      countsByGeo[geoId].total++;
      const status = (child.prospects as unknown as { status: PipelineStage })
        .status;
      if (status === "committed" || status === "enrolled") {
        countsByGeo[geoId].enrolled++;
      }
    }
  }

  const { data: champions } = await supabase
    .from("profiles")
    .select("geography_id, full_name")
    .eq("role", "champion")
    .eq("is_active", true);

  const championMap: Record<string, string> = {};
  if (champions) {
    for (const c of champions) {
      if (c.geography_id) {
        championMap[c.geography_id] = c.full_name;
      }
    }
  }

  const cards: GeographyCard[] = geographies.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.name,
    status: g.status,
    enrolledCount: countsByGeo[g.id]?.enrolled || 0,
    totalChildren: countsByGeo[g.id]?.total || 0,
    championName: championMap[g.id] || null,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        Leaderboard
      </h1>
      <LeaderboardGrid geographies={cards} />
    </div>
  );
}
