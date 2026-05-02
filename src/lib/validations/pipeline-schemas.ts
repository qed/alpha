import { z } from "zod";
import { ENGAGEMENT_SIGNALS, CONCERNS } from "@/lib/constants/pipeline";

const stripHtml = (val: string) => val.replace(/<[^>]*>/g, "").trim();

export const createPipelineProspectSchema = z.object({
  parent_first: z.string().min(1).max(100).transform(stripHtml),
  parent_last: z.string().min(1).max(100).transform(stripHtml),
  parent_email: z
    .string()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase())
    .optional(),
  parent_phone: z.string().max(20).transform(stripHtml).optional(),
  spouse_name: z.string().max(200).transform(stripHtml).optional(),
  neighborhood: z.string().max(100).transform(stripHtml).optional(),
  source: z.string().max(100).transform(stripHtml).optional(),
});

export const toggleSignalSchema = z.object({
  prospect_id: z.string().uuid(),
  signal_id: z.enum(ENGAGEMENT_SIGNALS),
  active: z.boolean(),
});

export const updateConcernsSchema = z.object({
  prospect_id: z.string().uuid(),
  concerns: z.array(z.enum(CONCERNS)).max(8),
});

export const overrideHeatSchema = z.object({
  prospect_id: z.string().uuid(),
  heat_score: z.number().int().min(1).max(5),
});

export const addPipelineNoteSchema = z.object({
  prospect_id: z.string().uuid(),
  body: z.string().min(1).max(2000).transform(stripHtml),
});

export type CreatePipelineProspectData = z.infer<typeof createPipelineProspectSchema>;
export type ToggleSignalData = z.infer<typeof toggleSignalSchema>;
export type UpdateConcernsData = z.infer<typeof updateConcernsSchema>;
export type OverrideHeatData = z.infer<typeof overrideHeatSchema>;
export type AddPipelineNoteData = z.infer<typeof addPipelineNoteSchema>;
