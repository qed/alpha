import { describe, it, expect } from "vitest";
import {
  suggestHeat,
  deriveNextMove,
  type ProspectForCopilot,
} from "@/lib/pipeline/copilot-engine";

describe("suggestHeat", () => {
  it("interested with 0 signals, 0 days → heat 3", () => {
    expect(suggestHeat([], 0, "interested")).toBe(3);
  });

  it("interested with 3 signals → heat 4", () => {
    expect(suggestHeat(["faq", "1-1", "intro"], 0, "interested")).toBe(4);
  });

  it("interested with 5 signals → heat 5", () => {
    expect(suggestHeat(["faq", "1-1", "intro", "deposit", "tour"], 0, "interested")).toBe(5);
  });

  it("interested with 0 signals, 15 days → heat 2", () => {
    expect(suggestHeat([], 15, "interested")).toBe(2);
  });

  it("interested with 0 signals, 22 days → heat 1", () => {
    expect(suggestHeat([], 22, "interested")).toBe(1);
  });

  it("enrolled with 0 signals, 0 days → heat 5", () => {
    expect(suggestHeat([], 0, "enrolled")).toBe(5);
  });

  it("lost always → heat 1", () => {
    expect(suggestHeat(["faq", "1-1", "intro", "deposit", "tour"], 0, "lost")).toBe(1);
  });

  it("shadow-day with 4 signals, 16 days → 3", () => {
    expect(suggestHeat(["faq", "1-1", "intro", "deposit"], 16, "shadow-day")).toBe(3);
  });

  it("signals counteract recency: interested with 3 signals, 15 days → 3", () => {
    expect(suggestHeat(["faq", "1-1", "intro"], 15, "interested")).toBe(3);
  });

  it("clamps to minimum 1", () => {
    expect(suggestHeat([], 30, "lost")).toBe(1);
  });

  it("clamps to maximum 5", () => {
    expect(suggestHeat(["faq", "1-1", "intro", "deposit", "tour", "shadow"], 0, "enrolled")).toBe(5);
  });
});

describe("deriveNextMove", () => {
  const base: ProspectForCopilot = {
    stage: "interested",
    heat_score: 3,
    concerns: [],
    daysSinceLastTouch: 0,
  };

  it("rule 1: lost stage → no action needed", () => {
    const result = deriveNextMove({ ...base, stage: "lost" }, new Set());
    expect(result.ruleId).toBe(1);
    expect(result.message).toContain("lost status");
  });

  it("rule 2: 22 days cold + heat 2 → last invite", () => {
    const result = deriveNextMove(
      { ...base, daysSinceLastTouch: 22, heat_score: 2 },
      new Set()
    );
    expect(result.ruleId).toBe(2);
    expect(result.message).toContain("public-event invite");
  });

  it("rule 2 not triggered: 22 days but heat 3", () => {
    const result = deriveNextMove(
      { ...base, daysSinceLastTouch: 22, heat_score: 3 },
      new Set()
    );
    expect(result.ruleId).not.toBe(2);
  });

  it("rule 3: tuition concern, no item sent → tuition recommendation", () => {
    const result = deriveNextMove(
      { ...base, concerns: ["tuition"] },
      new Set()
    );
    expect(result.ruleId).toBe(3);
    expect(result.message).toContain("Tuition");
  });

  it("rule 3: screen-time concern, no item sent → screen-time recommendation", () => {
    const result = deriveNextMove(
      { ...base, concerns: ["screen-time"] },
      new Set()
    );
    expect(result.ruleId).toBe(3);
    expect(result.message).toContain("Screen Time");
  });

  it("rule 3: tuition sent + accreditation not sent → accreditation recommendation", () => {
    const result = deriveNextMove(
      { ...base, concerns: ["tuition", "accreditation"] },
      new Set(["tuition"])
    );
    expect(result.ruleId).toBe(3);
    expect(result.message).toContain("Accreditation");
  });

  it("rule 3 skipped: all concerns have sent items", () => {
    const result = deriveNextMove(
      { ...base, concerns: ["tuition"] },
      new Set(["tuition"])
    );
    expect(result.ruleId).not.toBe(3);
  });

  it("rule 4: interested, heat 4, 6 days → coffee or shadow day", () => {
    const result = deriveNextMove(
      { ...base, heat_score: 4, daysSinceLastTouch: 6 },
      new Set()
    );
    expect(result.ruleId).toBe(4);
    expect(result.message).toContain("coffee");
  });

  it("rule 5: shadow-day stage → confirm logistics", () => {
    const result = deriveNextMove(
      { ...base, stage: "shadow-day" },
      new Set()
    );
    expect(result.ruleId).toBe(5);
    expect(result.message).toContain("logistics");
  });

  it("rule 6: committed stage → loop into depositors", () => {
    const result = deriveNextMove(
      { ...base, stage: "committed" },
      new Set()
    );
    expect(result.ruleId).toBe(6);
    expect(result.message).toContain("depositors");
  });

  it("rule 7: fallback → personalized note", () => {
    const result = deriveNextMove(base, new Set());
    expect(result.ruleId).toBe(7);
    expect(result.message).toContain("personalized note");
  });

  it("rule priority: lost takes precedence over everything", () => {
    const result = deriveNextMove(
      { stage: "lost", heat_score: 1, concerns: ["tuition"], daysSinceLastTouch: 30 },
      new Set()
    );
    expect(result.ruleId).toBe(1);
  });

  it("rule priority: rule 2 before rule 3", () => {
    const result = deriveNextMove(
      { stage: "interested", heat_score: 2, concerns: ["tuition"], daysSinceLastTouch: 22 },
      new Set()
    );
    expect(result.ruleId).toBe(2);
  });
});
