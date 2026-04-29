export const PIPELINE_STAGES = [
  "interested",
  "shadow-day",
  "committed",
  "enrolled",
  "lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const ENROLLMENT_STAGES: readonly PipelineStage[] = [
  "committed",
  "enrolled",
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  interested: "Interested",
  "shadow-day": "Shadow Day",
  committed: "Committed",
  enrolled: "Enrolled",
  lost: "Lost",
};

export const STAGE_COLORS: Record<
  PipelineStage,
  { bg: string; text: string }
> = {
  interested: { bg: "bg-ink-3", text: "text-white" },
  "shadow-day": { bg: "bg-alpha-blue", text: "text-white" },
  committed: { bg: "bg-alpha-sun", text: "text-warning" },
  enrolled: { bg: "bg-success", text: "text-white" },
  lost: { bg: "bg-danger", text: "text-white" },
};

export const ALLOWED_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  interested: ["shadow-day", "lost"],
  "shadow-day": ["interested", "committed", "lost"],
  committed: ["shadow-day", "enrolled", "lost"],
  enrolled: ["committed", "lost"],
  lost: ["interested"],
};

export function isValidTransition(
  from: PipelineStage,
  to: PipelineStage
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isEnrollmentStage(stage: PipelineStage): boolean {
  return ENROLLMENT_STAGES.includes(stage);
}

export const ENROLLMENT_THRESHOLD = 25;
