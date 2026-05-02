import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AvailableGeography {
  id: string;
  name: string;
  region: string | null;
  country: string;
}

export async function getAvailableGeographies(): Promise<AvailableGeography[]> {
  const supabase = getSupabaseAdminClient();

  const { data: geographies } = await supabase
    .from("geographies")
    .select("id, name, region, country")
    .order("name");

  if (!geographies) return [];

  const { data: activeUsers } = await supabase
    .from("profiles")
    .select("geography_id")
    .eq("is_active", true)
    .not("geography_id", "is", null);

  const claimed = new Set(
    (activeUsers || []).map((p) => p.geography_id)
  );

  return geographies.filter((g) => !claimed.has(g.id));
}
