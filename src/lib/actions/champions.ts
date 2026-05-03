"use server";

import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { clerkClient } from "@clerk/nextjs/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function inviteChampion(data: {
  email: string;
  fullName: string;
  geographyId: string;
}): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = getSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("geography_id", data.geographyId)
    .eq("role", "champion")
    .eq("is_active", true)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "This geography already has an active champion.",
    };
  }

  const clerkRes = await fetch("https://api.clerk.com/v1/invitations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: data.email,
      public_metadata: {},
      private_metadata: {
        role: "champion",
        geography_id: data.geographyId,
      },
    }),
  });

  if (!clerkRes.ok) {
    return { success: false, error: "Failed to send invitation." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.profileId,
    action: "champion-create",
    geography_id: data.geographyId,
    metadata: {
      invited_email: data.email,
      champion_name: data.fullName,
    },
  });

  return { success: true };
}

export async function deactivateChampion(
  profileId: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = getSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, geography_id, full_name, is_active")
    .eq("id", profileId)
    .single();

  if (!profile) {
    return { success: false, error: "Profile not found." };
  }

  if (profile.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("is_active", true);

    if ((count ?? 0) <= 1) {
      return {
        success: false,
        error: "Cannot deactivate the last admin account.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", profileId);

  if (error) {
    return { success: false, error: "Failed to deactivate champion." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.profileId,
    action: "champion-deactivate",
    geography_id: profile.geography_id,
    metadata: {
      champion_name: profile.full_name,
      profile_id: profileId,
    },
  });

  return { success: true };
}

export async function reassignGeography(data: {
  geographyId: string;
  newChampionProfileId: string;
}): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = getSupabaseAdminClient();

  const { data: newChampion } = await supabase
    .from("profiles")
    .select("id, full_name, geography_id, is_active, clerk_user_id")
    .eq("id", data.newChampionProfileId)
    .single();

  if (!newChampion || !newChampion.is_active) {
    return { success: false, error: "Target champion not found or inactive." };
  }

  const { data: currentChampion } = await supabase
    .from("profiles")
    .select("id, full_name, clerk_user_id")
    .eq("geography_id", data.geographyId)
    .eq("role", "champion")
    .eq("is_active", true)
    .maybeSingle();

  if (currentChampion) {
    await supabase
      .from("profiles")
      .update({ geography_id: null })
      .eq("id", currentChampion.id);

    try {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(currentChampion.clerk_user_id, {
        privateMetadata: { geography_id: null },
      });
    } catch {
      return {
        success: false,
        error: "Failed to clear old champion's session. Geography partially reassigned.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ geography_id: data.geographyId })
    .eq("id", data.newChampionProfileId);

  if (error) {
    return { success: false, error: "Failed to reassign geography." };
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(newChampion.clerk_user_id, {
      privateMetadata: { geography_id: data.geographyId },
    });
  } catch {
    return {
      success: false,
      error: "Geography reassigned in database but session update failed for new champion.",
    };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.profileId,
    action: "champion-reassign",
    geography_id: data.geographyId,
    metadata: {
      old_champion: currentChampion?.full_name || null,
      new_champion: newChampion.full_name,
    },
  });

  return { success: true };
}

export async function getChampionForGeography(
  geographyId: string
): Promise<{ email: string; name: string } | null> {
  const supabase = getSupabaseAdminClient();

  const { data: champion } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("geography_id", geographyId)
    .eq("role", "champion")
    .eq("is_active", true)
    .maybeSingle();

  if (champion) {
    return { email: champion.email, name: champion.full_name };
  }

  const { data: admin } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("role", "admin")
    .eq("is_active", true)
    .limit(1)
    .single();

  return admin ? { email: admin.email, name: admin.full_name } : null;
}
