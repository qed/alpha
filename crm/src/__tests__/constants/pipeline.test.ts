import { describe, it, expect } from "vitest";
import {
  PIPELINE_STAGES,
  ENROLLMENT_STAGES,
  ALLOWED_TRANSITIONS,
  isValidTransition,
  isEnrollmentStage,
  ENROLLMENT_THRESHOLD,
} from "@/lib/constants/pipeline";

describe("pipeline stages", () => {
  it("includes all 5 statuses", () => {
    expect(PIPELINE_STAGES).toEqual([
      "interested",
      "shadow-day",
      "committed",
      "enrolled",
      "lost",
    ]);
  });

  it("enrollment stages are exactly committed and enrolled", () => {
    expect(ENROLLMENT_STAGES).toEqual(["committed", "enrolled"]);
  });

  it("lost is excluded from enrollment stages", () => {
    expect(isEnrollmentStage("lost")).toBe(false);
  });

  it("interested is excluded from enrollment stages", () => {
    expect(isEnrollmentStage("interested")).toBe(false);
  });

  it("shadow-day is excluded from enrollment stages", () => {
    expect(isEnrollmentStage("shadow-day")).toBe(false);
  });

  it("enrollment threshold is 25", () => {
    expect(ENROLLMENT_THRESHOLD).toBe(25);
  });
});

describe("allowed transitions", () => {
  it("interested can go to shadow-day or lost", () => {
    expect(ALLOWED_TRANSITIONS["interested"]).toEqual(["shadow-day", "lost"]);
  });

  it("shadow-day can go forward to committed, back to interested, or lost", () => {
    expect(ALLOWED_TRANSITIONS["shadow-day"]).toEqual([
      "interested",
      "committed",
      "lost",
    ]);
  });

  it("committed can go forward to enrolled, back to shadow-day, or lost", () => {
    expect(ALLOWED_TRANSITIONS["committed"]).toEqual([
      "shadow-day",
      "enrolled",
      "lost",
    ]);
  });

  it("enrolled can step back to committed or go to lost", () => {
    expect(ALLOWED_TRANSITIONS["enrolled"]).toEqual(["committed", "lost"]);
  });

  it("lost can only re-engage to interested", () => {
    expect(ALLOWED_TRANSITIONS["lost"]).toEqual(["interested"]);
  });

  it("interested cannot skip to enrolled", () => {
    expect(isValidTransition("interested", "enrolled")).toBe(false);
  });

  it("interested cannot skip to committed", () => {
    expect(isValidTransition("interested", "committed")).toBe(false);
  });

  it("every stage can reach lost", () => {
    for (const stage of PIPELINE_STAGES) {
      if (stage === "lost") continue;
      expect(isValidTransition(stage, "lost")).toBe(true);
    }
  });
});
