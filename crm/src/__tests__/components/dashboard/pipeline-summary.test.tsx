import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import type { PipelineStage } from "@/lib/constants/pipeline";

function makeCounts(
  overrides: Partial<Record<PipelineStage, number>> = {}
): Record<PipelineStage, number> {
  return {
    interested: 0,
    "shadow-day": 0,
    committed: 0,
    enrolled: 0,
    lost: 0,
    ...overrides,
  };
}

describe("PipelineSummary", () => {
  it("displays correct child count per stage", () => {
    const counts = makeCounts({
      interested: 5,
      "shadow-day": 3,
      committed: 2,
      enrolled: 1,
      lost: 1,
    });
    const { container } = render(
      <PipelineSummary childCounts={counts} enrolledCount={3} />
    );
    const numbers = container.querySelectorAll(".text-2xl");
    expect(numbers[0].textContent).toBe("5");
    expect(numbers[1].textContent).toBe("3");
    expect(numbers[2].textContent).toBe("2");
    expect(numbers[3].textContent).toBe("1");
    expect(numbers[4].textContent).toBe("1");
  });

  it("progress bar counts only committed + enrolled children", () => {
    const counts = makeCounts({
      interested: 10,
      committed: 5,
      enrolled: 8,
      lost: 3,
    });
    const { container } = render(
      <PipelineSummary childCounts={counts} enrolledCount={13} />
    );
    const allText = container.textContent;
    expect(allText).toContain("13 / 25");
  });

  it("lost children excluded from progress count", () => {
    const counts = makeCounts({ committed: 2, enrolled: 3, lost: 10 });
    const { container } = render(
      <PipelineSummary childCounts={counts} enrolledCount={5} />
    );
    const allText = container.textContent;
    expect(allText).toContain("5 / 25");
  });

  it("a family with 3 enrolled children shows 3 in the enrolled count", () => {
    const counts = makeCounts({ enrolled: 3 });
    const { container } = render(
      <PipelineSummary childCounts={counts} enrolledCount={3} />
    );
    const numbers = container.querySelectorAll(".text-2xl");
    expect(numbers[3].textContent).toBe("3");
  });
});
