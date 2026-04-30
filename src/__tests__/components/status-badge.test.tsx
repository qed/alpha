import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS } from "@/lib/constants/pipeline";
import type { PipelineStage } from "@/lib/constants/pipeline";

describe("StatusBadge", () => {
  it.each(PIPELINE_STAGES)("renders label for %s stage", (stage) => {
    render(<StatusBadge stage={stage} />);
    expect(screen.getByText(STAGE_LABELS[stage])).toBeInTheDocument();
  });

  it.each(PIPELINE_STAGES)("applies correct color classes for %s stage", (stage) => {
    const { container } = render(<StatusBadge stage={stage} />);
    const badge = container.firstChild as HTMLElement;
    const colors = STAGE_COLORS[stage];
    expect(badge.className).toContain(colors.bg);
    expect(badge.className).toContain(colors.text);
  });

  it("lost badge uses danger color", () => {
    const { container } = render(<StatusBadge stage="lost" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-danger");
  });

  it("accepts additional className", () => {
    const { container } = render(
      <StatusBadge stage="enrolled" className="ml-2" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("ml-2");
  });
});
