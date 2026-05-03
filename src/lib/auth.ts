import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export interface SessionInfo {
  userId: string;
  profileId: string;
  role: "admin" | "champion";
  geographyId: string | null;
}

export async function requireAuth(): Promise<SessionInfo> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/hub");
  }

  const supabase = getSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, geography_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/hub");
  }

  const role = profile.role === "admin" ? "admin" : "champion";
  const geographyId = profile.geography_id ?? null;

  return { userId, profileId: profile.id, role, geographyId };
}

export async function requireAdmin(): Promise<SessionInfo> {
  const session = await requireAuth();
  if (session.role !== "admin") {
    redirect("/hub/dashboard");
  }
  return session;
}

export async function requireAuthenticated(): Promise<SessionInfo> {
  return requireAuth();
}
