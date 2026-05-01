"use server";

import { requireAuthenticated } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { clerkClient } from "@clerk/nextjs/server";
import { RESERVED_SLUGS } from "@/lib/constants/geographies";
import {
  selectGeographySchema,
  createGeographySchema,
} from "@/lib/validations/geography-selection-schema";

interface ActionResult {
  success: boolean;
  error?: string;
  retryable?: boolean;
  geographyId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureProfile(supabase: ReturnType<typeof getSupabaseAdminClient>, session: { userId: string; role: string }) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, geography_id, clerk_user_id")
    .eq("clerk_user_id", session.userId)
    .maybeSingle();

  if (profile) return profile;

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(session.userId);
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const { data: created, error } = await supabase
    .from("profiles")
    .upsert(
      {
        clerk_user_id: session.userId,
        email,
        full_name: fullName,
        role: session.role,
        is_active: true,
      },
      { onConflict: "clerk_user_id" }
    )
    .select("id, geography_id, clerk_user_id")
    .single();

  if (error || !created) {
    throw new Error("Failed to create profile");
  }

  return created;
}

async function assignGeography(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  profileId: string,
  clerkUserId: string,
  geographyId: string
): Promise<ActionResult> {
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ geography_id: geographyId })
    .eq("id", profileId);

  if (updateError) {
    if (updateError.code === "23505") {
      return {
        success: false,
        error: "This geography was just claimed by another champion.",
      };
    }
    return { success: false, error: "Failed to assign geography." };
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkUserId, {
      privateMetadata: { geography_id: geographyId },
    });
  } catch {
    return {
      success: false,
      error: "Geography saved but session update failed. Please try again.",
      retryable: true,
    };
  }

  return { success: true };
}

export async function selectGeography(
  input: unknown
): Promise<ActionResult> {
  const session = await requireAuthenticated();

  if (session.role !== "champion") {
    return { success: false, error: "Only champions can select a geography." };
  }

  const parsed = selectGeographySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const supabase = getSupabaseAdminClient();
  const profile = await ensureProfile(supabase, session);

  if (profile.geography_id) {
    if (session.geographyId) {
      return { success: false, error: "You already have a geography assigned." };
    }

    // Partial failure retry: Supabase has geography but Clerk does not
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(session.userId, {
        privateMetadata: { geography_id: profile.geography_id },
      });
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Session update failed. Please try again.",
        retryable: true,
      };
    }
  }

  const result = await assignGeography(
    supabase,
    profile.id,
    session.userId,
    parsed.data.geographyId
  );

  if (result.success) {
    await supabase.from("audit_log").insert({
      actor_id: profile.id,
      action: "geography-select",
      geography_id: parsed.data.geographyId,
    });
  }

  return result;
}

export async function createGeography(
  input: unknown
): Promise<ActionResult> {
  const session = await requireAuthenticated();

  if (session.role !== "champion") {
    return { success: false, error: "Only champions can create a geography." };
  }

  const parsed = createGeographySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const supabase = getSupabaseAdminClient();
  const profile = await ensureProfile(supabase, session);

  if (profile.geography_id) {
    return { success: false, error: "You already have a geography assigned." };
  }

  const { name, region, country } = parsed.data;

  let slug = `${slugify(name)}-${slugify(region)}`;

  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) {
    slug = `${slug}-1`;
  }

  const { data: existingSlugs } = await supabase
    .from("geographies")
    .select("slug")
    .like("slug", `${slug}%`);

  if (existingSlugs && existingSlugs.length > 0) {
    const taken = new Set(existingSlugs.map((g) => g.slug));
    if (taken.has(slug)) {
      let suffix = 2;
      while (taken.has(`${slug}-${suffix}`)) {
        suffix++;
      }
      slug = `${slug}-${suffix}`;
    }
  }

  const { data: geography, error: insertError } = await supabase
    .from("geographies")
    .insert({
      slug,
      name,
      region,
      country,
      status: "pre-launch",
    })
    .select("id")
    .single();

  if (insertError || !geography) {
    return { success: false, error: "Failed to create geography." };
  }

  const result = await assignGeography(
    supabase,
    profile.id,
    session.userId,
    geography.id
  );

  if (result.success) {
    await supabase.from("audit_log").insert({
      actor_id: profile.id,
      action: "geography-create",
      geography_id: geography.id,
      metadata: { slug, name, region, country },
    });
  }

  return { ...result, geographyId: geography.id };
}
