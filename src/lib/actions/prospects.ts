"use server";

import { requireAuthenticated, requireAdmin } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  isValidTransition,
  ENROLLMENT_THRESHOLD,
  type PipelineStage,
} from "@/lib/constants/pipeline";
import {
  updateStatusSchema,
  addNoteSchema,
  setFollowUpSchema,
  createProspectSchema,
} from "@/lib/validations/prospect-schema";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateProspectStatus(
  data: unknown
): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }
  const parsed = updateStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { prospect_id, new_status, updated_at } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect, error: fetchError } = await supabase
    .from("prospects")
    .select("id, status, updated_at, geography_id")
    .eq("id", prospect_id)
    .single();

  if (fetchError || !prospect) {
    return { success: false, error: "Prospect not found." };
  }

  if (prospect.geography_id !== session.geographyId) {
    return { success: false, error: "Access denied." };
  }

  if (prospect.updated_at !== updated_at) {
    return {
      success: false,
      error: "This record was modified by someone else. Please reload and try again.",
    };
  }

  if (!isValidTransition(prospect.status as PipelineStage, new_status)) {
    return {
      success: false,
      error: `Cannot transition from ${prospect.status} to ${new_status}.`,
    };
  }

  const { error: updateError } = await supabase
    .from("prospects")
    .update({ status: new_status })
    .eq("id", prospect_id);

  if (updateError) {
    return { success: false, error: "Failed to update status." };
  }

  await supabase.from("status_history").insert({
    prospect_id,
    geography_id: session.geographyId,
    old_status: prospect.status,
    new_status,
    changed_by: session.userId,
  });

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "status-change",
    geography_id: session.geographyId,
    prospect_id,
    metadata: {
      old_status: prospect.status,
      new_status,
    },
  });

  await checkAutoPromotion(session.geographyId, session.userId);

  return { success: true };
}

export async function addNote(data: unknown): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }
  const parsed = addNoteSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { prospect_id, body } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, geography_id")
    .eq("id", prospect_id)
    .single();

  if (!prospect || prospect.geography_id !== session.geographyId) {
    return { success: false, error: "Prospect not found." };
  }

  const { error } = await supabase.from("notes").insert({
    prospect_id,
    geography_id: session.geographyId,
    author_id: session.userId,
    body,
  });

  if (error) {
    return { success: false, error: "Failed to add note." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "note-add",
    geography_id: session.geographyId,
    prospect_id,
    metadata: { body_preview: body.slice(0, 100) },
  });

  return { success: true };
}

export async function setFollowUpDate(data: unknown): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }
  const parsed = setFollowUpSchema.safeParse(data);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message || "Invalid input.";
    return { success: false, error: msg };
  }

  const { prospect_id, follow_up_date, updated_at } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, geography_id, updated_at")
    .eq("id", prospect_id)
    .single();

  if (!prospect || prospect.geography_id !== session.geographyId) {
    return { success: false, error: "Prospect not found." };
  }

  if (prospect.updated_at !== updated_at) {
    return {
      success: false,
      error: "This record was modified by someone else. Please reload and try again.",
    };
  }

  const { error } = await supabase
    .from("prospects")
    .update({ follow_up_date })
    .eq("id", prospect_id);

  if (error) {
    return { success: false, error: "Failed to set follow-up date." };
  }

  return { success: true };
}

export async function createProspect(data: unknown): Promise<ActionResult & { prospectId?: string }> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }
  const parsed = createProspectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { children, ...parentFields } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect, error: insertError } = await supabase
    .from("prospects")
    .insert({
      geography_id: session.geographyId,
      ...parentFields,
      status: "interested",
      consent_given: true,
      consent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !prospect) {
    return { success: false, error: "Failed to create prospect." };
  }

  if (children.length > 0) {
    const childRows = children.map((c) => ({
      prospect_id: prospect.id,
      geography_id: session.geographyId,
      first_name: c.first_name,
      grade: c.grade || null,
      age: c.age ?? null,
      gender: c.gender || null,
    }));

    await supabase.from("children").insert(childRows);
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "prospect-create",
    geography_id: session.geographyId,
    prospect_id: prospect.id,
    metadata: {
      parent_name: `${parentFields.parent_first} ${parentFields.parent_last}`,
      child_count: children.length,
      source: "manual",
    },
  });

  return { success: true, prospectId: prospect.id };
}

async function checkAutoPromotion(
  geographyId: string,
  actorId: string
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  const { data: geography } = await supabase
    .from("geographies")
    .select("id, status")
    .eq("id", geographyId)
    .single();

  if (!geography || geography.status !== "pre-launch") return;

  const { data: children } = await supabase
    .from("children")
    .select("id, prospects!inner(status)")
    .eq("geography_id", geographyId);

  if (!children) return;

  let enrolledCount = 0;
  for (const child of children) {
    const status = (child.prospects as unknown as { status: PipelineStage })
      .status;
    if (status === "committed" || status === "enrolled") {
      enrolledCount++;
    }
  }

  if (enrolledCount >= ENROLLMENT_THRESHOLD) {
    await supabase
      .from("geographies")
      .update({ status: "active-campus" })
      .eq("id", geographyId);

    await supabase.from("audit_log").insert({
      actor_id: actorId,
      action: "status-change",
      geography_id: geographyId,
      metadata: {
        entity: "geography",
        old_status: "pre-launch",
        new_status: "active-campus",
        reason: "auto-promotion",
        enrolled_count: enrolledCount,
      },
    });
  }
}

export async function deleteProspect(
  prospectId: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, geography_id, parent_first")
    .eq("id", prospectId)
    .single();

  if (!prospect) {
    return { success: false, error: "Prospect not found." };
  }

  await supabase.from("notes").delete().eq("prospect_id", prospectId);
  await supabase.from("status_history").delete().eq("prospect_id", prospectId);
  await supabase.from("children").delete().eq("prospect_id", prospectId);
  const { error } = await supabase
    .from("prospects")
    .delete()
    .eq("id", prospectId);

  if (error) {
    return { success: false, error: "Failed to delete prospect." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "prospect-delete",
    geography_id: prospect.geography_id,
    prospect_id: prospectId,
    metadata: {
      deleted_prospect_id: prospectId,
    },
  });

  return { success: true };
}
