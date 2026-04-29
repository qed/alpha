export type GeographyStatus = "pre-launch" | "existing-campus" | "active-campus";

export interface Geography {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  country: "US" | "CA";
  status: GeographyStatus;
  enrollment_threshold: number;
}
