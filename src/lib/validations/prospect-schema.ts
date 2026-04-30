import { z } from "zod";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline";

const stripHtml = (val: string) => val.replace(/<[^>]*>/g, "").trim();

export const updateStatusSchema = z.object({
  prospect_id: z.string().uuid(),
  new_status: z.enum(PIPELINE_STAGES),
  updated_at: z.string().datetime(),
});

export const addNoteSchema = z.object({
  prospect_id: z.string().uuid(),
  body: z
    .string()
    .min(1)
    .max(2000)
    .transform(stripHtml),
});

export const setFollowUpSchema = z.object({
  prospect_id: z.string().uuid(),
  follow_up_date: z
    .string()
    .date()
    .refine(
      (val) => {
        const [year, month, day] = val.split("-").map(Number);
        const now = new Date();
        const todayNum =
          now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        const dateNum = year * 10000 + month * 100 + day;
        return dateNum >= todayNum;
      },
      { message: "Follow-up date cannot be in the past" }
    )
    .nullable(),
  updated_at: z.string().datetime(),
});

export const createProspectSchema = z.object({
  parent_first: z.string().min(1).max(100).transform(stripHtml),
  parent_last: z.string().min(1).max(100).transform(stripHtml),
  parent_email: z.string().email().max(254).transform((v) => v.toLowerCase()),
  parent_phone: z.string().max(20).optional().default(""),
  spouse_name: z.string().max(200).transform(stripHtml).optional().default(""),
  source: z.string().max(100).optional().default(""),
  children: z
    .array(
      z.object({
        first_name: z.string().min(1).max(100).transform(stripHtml),
        grade: z.string().max(20).optional().default(""),
        age: z.coerce.number().int().min(2).max(19).optional(),
        gender: z
          .enum(["male", "female", "non-binary", "prefer-not-to-say", ""])
          .optional()
          .default(""),
      })
    )
    .min(1)
    .max(15),
});

export type UpdateStatusData = z.infer<typeof updateStatusSchema>;
export type AddNoteData = z.infer<typeof addNoteSchema>;
export type SetFollowUpData = z.infer<typeof setFollowUpSchema>;
export type CreateProspectData = z.infer<typeof createProspectSchema>;
