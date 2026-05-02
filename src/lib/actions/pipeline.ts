"use server";

import { requireAuthenticated } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createPipelineProspectSchema,
  toggleSignalSchema,
  updateConcernsSchema,
  overrideHeatSchema,
  addPipelineNoteSchema,
} from "@/lib/validations/pipeline-schemas";

interface ActionResult {
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// 1. createPipelineProspect
// ---------------------------------------------------------------------------

export async function createPipelineProspect(
  data: unknown
): Promise<ActionResult & { prospectId?: string }> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }

  const parsed = createPipelineProspectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const supabase = await getSupabaseServerClient();

  const { data: prospect, error: insertError } = await supabase
    .from("prospects")
    .insert({
      geography_id: session.geographyId,
      ...parsed.data,
      status: "interested",
      heat_score: 3,
      consent_given: true,
      consent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !prospect) {
    return { success: false, error: "Failed to create prospect." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "prospect-create",
    geography_id: session.geographyId,
    prospect_id: prospect.id,
    metadata: {
      parent_name: `${parsed.data.parent_first} ${parsed.data.parent_last}`,
      source: "pipeline",
    },
  });

  return { success: true, prospectId: prospect.id };
}

// ---------------------------------------------------------------------------
// 2. toggleSignal
// ---------------------------------------------------------------------------

export async function toggleSignal(data: unknown): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }

  const parsed = toggleSignalSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { prospect_id, signal_id, active } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect, error: fetchError } = await supabase
    .from("prospects")
    .select("id, geography_id, engagement_signals")
    .eq("id", prospect_id)
    .single();

  if (fetchError || !prospect) {
    return { success: false, error: "Prospect not found." };
  }

  if (prospect.geography_id !== session.geographyId) {
    return { success: false, error: "Access denied." };
  }

  const currentSignals: string[] = prospect.engagement_signals ?? [];
  let updatedSignals: string[];

  if (active) {
    updatedSignals = currentSignals.includes(signal_id)
      ? currentSignals
      : [...currentSignals, signal_id];
  } else {
    updatedSignals = currentSignals.filter((s) => s !== signal_id);
  }

  const { error: updateError } = await supabase
    .from("prospects")
    .update({
      engagement_signals: updatedSignals,
      last_touch_at: new Date().toISOString(),
    })
    .eq("id", prospect_id);

  if (updateError) {
    return { success: false, error: "Failed to update signals." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "signal-toggle",
    geography_id: session.geographyId,
    prospect_id,
    metadata: { signal_id, active },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// 3. updateConcerns
// ---------------------------------------------------------------------------

export async function updateConcerns(data: unknown): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }

  const parsed = updateConcernsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { prospect_id, concerns } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect, error: fetchError } = await supabase
    .from("prospects")
    .select("id, geography_id")
    .eq("id", prospect_id)
    .single();

  if (fetchError || !prospect) {
    return { success: false, error: "Prospect not found." };
  }

  if (prospect.geography_id !== session.geographyId) {
    return { success: false, error: "Access denied." };
  }

  const { error: updateError } = await supabase
    .from("prospects")
    .update({
      concerns,
      last_touch_at: new Date().toISOString(),
    })
    .eq("id", prospect_id);

  if (updateError) {
    return { success: false, error: "Failed to update concerns." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "concern-update",
    geography_id: session.geographyId,
    prospect_id,
    metadata: { concerns },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// 4. overrideHeat
// ---------------------------------------------------------------------------

export async function overrideHeat(data: unknown): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }

  const parsed = overrideHeatSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { prospect_id, heat_score } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect, error: fetchError } = await supabase
    .from("prospects")
    .select("id, geography_id, heat_score")
    .eq("id", prospect_id)
    .single();

  if (fetchError || !prospect) {
    return { success: false, error: "Prospect not found." };
  }

  if (prospect.geography_id !== session.geographyId) {
    return { success: false, error: "Access denied." };
  }

  const oldHeat = prospect.heat_score;

  const { error: updateError } = await supabase
    .from("prospects")
    .update({
      heat_score,
      last_touch_at: new Date().toISOString(),
    })
    .eq("id", prospect_id);

  if (updateError) {
    return { success: false, error: "Failed to update heat score." };
  }

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "heat-override",
    geography_id: session.geographyId,
    prospect_id,
    metadata: { old_heat: oldHeat, new_heat: heat_score },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// 5. addPipelineNote
// ---------------------------------------------------------------------------

export async function addPipelineNote(data: unknown): Promise<ActionResult> {
  const session = await requireAuthenticated();
  if (!session.geographyId) {
    return { success: false, error: "No geography assigned." };
  }

  const parsed = addPipelineNoteSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { prospect_id, body } = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { data: prospect, error: fetchError } = await supabase
    .from("prospects")
    .select("id, geography_id")
    .eq("id", prospect_id)
    .single();

  if (fetchError || !prospect) {
    return { success: false, error: "Prospect not found." };
  }

  if (prospect.geography_id !== session.geographyId) {
    return { success: false, error: "Access denied." };
  }

  const { error: noteError } = await supabase.from("notes").insert({
    prospect_id,
    geography_id: session.geographyId,
    author_id: session.userId,
    body,
  });

  if (noteError) {
    return { success: false, error: "Failed to add note." };
  }

  await supabase
    .from("prospects")
    .update({ last_touch_at: new Date().toISOString() })
    .eq("id", prospect_id);

  await supabase.from("audit_log").insert({
    actor_id: session.userId,
    action: "note-add",
    geography_id: session.geographyId,
    prospect_id,
    metadata: { body_preview: body.slice(0, 100) },
  });

  return { success: true };
}
