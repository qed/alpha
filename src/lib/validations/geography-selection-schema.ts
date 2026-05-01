import { z } from "zod";

const stripHtml = (val: string) => val.replace(/<[^>]*>/g, "").trim();

const safeText = (maxLen: number) =>
  z.string().min(1).max(maxLen).transform(stripHtml);

export const selectGeographySchema = z.object({
  geographyId: z.string().uuid(),
});

export const createGeographySchema = z.object({
  name: safeText(100),
  region: safeText(100),
  country: z.enum(["US", "CA"]),
});

export type SelectGeographyInput = z.infer<typeof selectGeographySchema>;
export type CreateGeographyInput = z.infer<typeof createGeographySchema>;
