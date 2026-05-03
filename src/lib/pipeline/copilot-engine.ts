import type { PipelineStage } from "@/lib/constants/pipeline";
import { CONCERN_LABELS, type Concern } from "@/lib/constants/pipeline";

const HEAT_BASE: Record<PipelineStage, number> = {
  interested: 3,
  "shadow-day": 3,
  committed: 4,
  enrolled: 5,
  lost: 1,
};

export function suggestHeat(
  signals: string[],
  daysSinceLast: number,
  stage: PipelineStage
): number {
  if (stage === "lost") return 1;
  let heat = HEAT_BASE[stage];
  if (signals.length >= 5) heat += 2;
  else if (signals.length >= 3) heat += 1;
  if (daysSinceLast > 21) heat -= 2;
  else if (daysSinceLast > 14) heat -= 1;
  return Math.max(1, Math.min(5, heat));
}

export interface NextMoveResult {
  message: string;
  ruleId: number;
}

export interface ProspectForCopilot {
  stage: PipelineStage;
  heat_score: number;
  concerns: string[];
  daysSinceLastTouch: number;
}

export function deriveNextMove(
  prospect: ProspectForCopilot,
  sentConcerns: Set<string>
): NextMoveResult {
  const { stage, heat_score, concerns, daysSinceLastTouch } = prospect;

  if (stage === "lost") {
    return { message: "This prospect is in lost status. No action needed.", ruleId: 1 };
  }

  if (daysSinceLastTouch > 21 && heat_score <= 2) {
    return {
      message: "21 days cold + low heat. One last public-event invite, then move to lost.",
      ruleId: 2,
    };
  }

  const unaddressedConcern = concerns.find((c) => !sentConcerns.has(c));
  if (unaddressedConcern) {
    const label = CONCERN_LABELS[unaddressedConcern as Concern] ?? unaddressedConcern;
    return {
      message: `Send an answer addressing "${label}" concern.`,
      ruleId: 3,
    };
  }

  if (stage === "interested" && heat_score >= 4 && daysSinceLastTouch > 5) {
    return { message: "Hot + cooling. Suggest a coffee or a shadow day.", ruleId: 4 };
  }

  if (stage === "shadow-day") {
    return { message: "Confirm shadow-day logistics within 48h.", ruleId: 5 };
  }

  if (stage === "committed") {
    return { message: "Loop into the depositors thread, send onboarding doc.", ruleId: 6 };
  }

  return { message: "Check in with a personalized note.", ruleId: 7 };
}
