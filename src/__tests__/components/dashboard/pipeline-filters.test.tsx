import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PipelineFilters } from "@/components/dashboard/pipeline-filters";
import type { PipelineStage } from "@/lib/constants/pipeline";

interface MinimalProspect {
  status: PipelineStage;
  neighborhood: string | null;
}

function makeProspect(
  status: PipelineStage,
  neighborhood: string | null = null
): MinimalProspect {
  return { status, neighborhood };
}

describe("PipelineFilters", () => {
  const allProspects: MinimalProspect[] = [
    makeProspect("interested", "Westlake"),
    makeProspect("interested", "Westlake"),
    makeProspect("interested", "Downtown"),
    makeProspect("shadow-day", "Westlake"),
    makeProspect("shadow-day", "Downtown"),
    makeProspect("committed", "Downtown"),
    makeProspect("enrolled", "Westlake"),
  ];

  it("clicking a stage pill calls onStageFilterChange with that stage", () => {
    const onStageChange = vi.fn();
    render(
      <PipelineFilters
        allProspects={allProspects}
        stageFilter={null}
        neighborhoodFilter={null}
        neighborhoods={["Westlake", "Downtown"]}
        onStageFilterChange={onStageChange}
        onNeighborhoodFilterChange={vi.fn()}
      />
    );

    // Find the "Shadow Day" button and click it
    const shadowDayBtn = screen.getByRole("button", { name: /Shadow Day/i });
    fireEvent.click(shadowDayBtn);

    expect(onStageChange).toHaveBeenCalledWith("shadow-day");
  });

  it("clicking the All stage pill calls onStageFilterChange with null", () => {
    const onStageChange = vi.fn();
    render(
      <PipelineFilters
        allProspects={allProspects}
        stageFilter="interested"
        neighborhoodFilter={null}
        neighborhoods={["Westlake", "Downtown"]}
        onStageFilterChange={onStageChange}
        onNeighborhoodFilterChange={vi.fn()}
      />
    );

    // The first "All" button is for stages
    const allButtons = screen.getAllByRole("button", { name: /^All/i });
    fireEvent.click(allButtons[0]);

    expect(onStageChange).toHaveBeenCalledWith(null);
  });

  it("stage pill counts reflect cross-filtered data (filtered by neighborhood only)", () => {
    const { container } = render(
      <PipelineFilters
        allProspects={allProspects}
        stageFilter={null}
        neighborhoodFilter="Westlake"
        neighborhoods={["Westlake", "Downtown"]}
        onStageFilterChange={vi.fn()}
        onNeighborhoodFilterChange={vi.fn()}
      />
    );

    // When filtered by Westlake neighborhood:
    // interested: 2 (both Westlake), shadow-day: 1 (Westlake), committed: 0, enrolled: 1 (Westlake), lost: 0
    // Total for "All": 4
    const stageSection = container.querySelectorAll(
      ".flex.gap-1\\.5.flex-wrap.items-center"
    )[0];
    const buttons = stageSection.querySelectorAll("button");

    // "All" pill — should show 4 (Westlake prospects only)
    expect(buttons[0].textContent).toContain("All");
    expect(buttons[0].textContent).toContain("4");

    // "Interested" pill — should show 2
    expect(buttons[1].textContent).toContain("Interested");
    expect(buttons[1].textContent).toContain("2");

    // "Shadow Day" pill — should show 1
    expect(buttons[2].textContent).toContain("Shadow Day");
    expect(buttons[2].textContent).toContain("1");

    // "Committed" pill — should show 0
    expect(buttons[3].textContent).toContain("Committed");
    expect(buttons[3].textContent).toContain("0");

    // "Enrolled" pill — should show 1
    expect(buttons[4].textContent).toContain("Enrolled");
    expect(buttons[4].textContent).toContain("1");
  });

  it("neighborhood pill counts reflect cross-filtered data (filtered by stage only)", () => {
    const { container } = render(
      <PipelineFilters
        allProspects={allProspects}
        stageFilter="interested"
        neighborhoodFilter={null}
        neighborhoods={["Westlake", "Downtown"]}
        onStageFilterChange={vi.fn()}
        onNeighborhoodFilterChange={vi.fn()}
      />
    );

    // When filtered by "interested" stage:
    // Westlake: 2, Downtown: 1
    const neighborhoodSection = container.querySelectorAll(
      ".flex.gap-1\\.5.flex-wrap.items-center"
    )[1];
    const buttons = neighborhoodSection.querySelectorAll("button");

    // "All" (neighborhood) pill
    expect(buttons[0].textContent).toContain("All");

    // "Westlake" pill — should show 2
    expect(buttons[1].textContent).toContain("Westlake");
    expect(buttons[1].textContent).toContain("2");

    // "Downtown" pill — should show 1
    expect(buttons[2].textContent).toContain("Downtown");
    expect(buttons[2].textContent).toContain("1");
  });

  it("clicking an active stage pill toggles it off (calls with null)", () => {
    const onStageChange = vi.fn();
    render(
      <PipelineFilters
        allProspects={allProspects}
        stageFilter="interested"
        neighborhoodFilter={null}
        neighborhoods={["Westlake", "Downtown"]}
        onStageFilterChange={onStageChange}
        onNeighborhoodFilterChange={vi.fn()}
      />
    );

    // "Interested" is currently active — clicking it should toggle off (pass null)
    const interestedBtn = screen.getByRole("button", { name: /Interested/i });
    fireEvent.click(interestedBtn);

    expect(onStageChange).toHaveBeenCalledWith(null);
  });

  it("neighborhoods section hidden when neighborhoods array is empty", () => {
    const { container } = render(
      <PipelineFilters
        allProspects={allProspects}
        stageFilter={null}
        neighborhoodFilter={null}
        neighborhoods={[]}
        onStageFilterChange={vi.fn()}
        onNeighborhoodFilterChange={vi.fn()}
      />
    );

    // Should only have the stage filter section, not the neighborhood one
    const sections = container.querySelectorAll(
      ".flex.gap-1\\.5.flex-wrap.items-center"
    );
    expect(sections).toHaveLength(1);

    // The "Area" label should not appear
    expect(screen.queryByText("Area")).not.toBeInTheDocument();
  });
});
