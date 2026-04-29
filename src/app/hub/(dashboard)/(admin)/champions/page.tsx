import { requireAdmin } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ChampionManager } from "@/components/admin/champion-manager";

export default async function ChampionsPage() {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, geography_id, is_active, role")
    .eq("role", "champion")
    .order("full_name");

  const { data: geographies } = await supabase
    .from("geographies")
    .select("id, name")
    .order("name");

  const geoNameMap: Record<string, string> = {};
  if (geographies) {
    for (const g of geographies) {
      geoNameMap[g.id] = g.name;
    }
  }

  const champions = (profiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    geography_id: p.geography_id,
    geography_name: p.geography_id ? geoNameMap[p.geography_id] || null : null,
    is_active: p.is_active,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        Champion Management
      </h1>
      <ChampionManager
        champions={champions}
        geographies={geographies || []}
      />
    </div>
  );
}
