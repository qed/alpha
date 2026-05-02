import { auth } from "@clerk/nextjs/server";
import { HubShell } from "@/components/hub/hub-shell";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  let geographyName: string | null = null;
  if (userId) {
    const supabase = getSupabaseAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("geography_id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profile?.geography_id) {
      const { data: geo } = await supabase
        .from("geographies")
        .select("name")
        .eq("id", profile.geography_id)
        .single();
      geographyName = geo?.name ?? null;
    }
  }

  return (
    <HubShell isAuthenticated={isAuthenticated} geographyName={geographyName}>
      {children}
    </HubShell>
  );
}
