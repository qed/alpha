import { z } from "zod";

const stripHtml = (val: string) => val.replace(/<[^>]*>/g, "").trim();

const safeText = (maxLen: number) =>
  z.string().min(1).max(maxLen).transform(stripHtml);

const childSchema = z.object({
  first_name: safeText(100),
  grade: z.string().max(20).optional().default(""),
  age: z.coerce.number().int().min(2).max(19).optional(),
  gender: z
    .enum(["male", "female", "non-binary", "prefer-not-to-say", ""])
    .optional()
    .default(""),
});

export const intakeFormSchema = z.object({
  geography_slug: z.string().min(1).max(100),
  parent_first: safeText(100),
  parent_last: safeText(100),
  parent_email: z.string().email().max(254).transform((v) => v.toLowerCase()),
  parent_phone: z.string().max(20).optional().default(""),
  spouse_name: z.string().max(200).transform(stripHtml).optional().default(""),
  source: z.string().max(100).optional().default(""),
  postal_code: z.string().max(10).optional().default(""),
  children: z.array(childSchema).min(1).max(15),
  consent: z.literal(true, {
    message: "You must agree to the privacy policy",
  }),
  turnstile_token: z.string().min(1),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

export const SOURCE_OPTIONS = [
  "Friend or family",
  "Social media",
  "Online search",
  "Community event",
  "News or article",
  "Alpha School website",
  "Other",
] as const;
