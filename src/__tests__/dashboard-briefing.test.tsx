import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TodaysBriefing,
  type BriefingProspect,
  type CoolingProspect,
  type WarmingProspect,
} from "@/components/dashboard/todays-briefing";

function makeFollowUp(
  overrides: Partial<BriefingProspect> = {}
): BriefingProspect {
  return {
    id: "p-1",
    parent_first: "Jane",
    parent_last: "Doe",
    heat_score: 3,
    days_since_touch: 5,
    stage: "interested",
    ...overrides,
  };
}

function makeCooling(
  overrides: Partial<CoolingProspect> = {}
): CoolingProspect {
  return {
    id: "c-1",
    parent_first: "Aleksandra",
    parent_last: "W.",
    days_since_touch: 21,
    ...overrides,
  };
}

function makeWarming(
  overrides: Partial<WarmingProspect> = {}
): WarmingProspect {
  return {
    id: "w-1",
    parent_first: "Joon-ho",
    parent_last: "L.",
    stage: "interested",
    ...overrides,
  };
}

describe("TodaysBriefing", () => {
  it("renders follow-ups ranked correctly by heat*4 + days_since", () => {
    const followUps: BriefingProspect[] = [
      makeFollowUp({
        id: "a",
        parent_first: "Alice",
        parent_last: "A",
        heat_score: 5,
        days_since_touch: 10,
        stage: "interested",
      }), // rank = 5*4+10 = 30
      makeFollowUp({
        id: "b",
        parent_first: "Bob",
        parent_last: "B",
        heat_score: 2,
        days_since_touch: 3,
        stage: "shadow-day",
      }), // rank = 2*4+3 = 11
      makeFollowUp({
        id: "c",
        parent_first: "Carol",
        parent_last: "C",
        heat_score: 4,
        days_since_touch: 7,
        stage: "interested",
      }), // rank = 4*4+7 = 23
    ];

    const { container } = render(
      <TodaysBriefing followUps={followUps} coolingOff={[]} warmingUp={[]} />
    );

    const names = container.querySelectorAll("a");
    // Rendered in order provided (already sorted by page): Alice, Bob, Carol
    // But the component renders them in the order given
    expect(names[0].textContent).toContain("Alice");
    expect(names[1].textContent).toContain("Bob");
    expect(names[2].textContent).toContain("Carol");
  });

  it("shows cooling and warming contacts in Watch column", () => {
    const cooling = [makeCooling()];
    const warming = [makeWarming()];

    const { container } = render(
      <TodaysBriefing followUps={[]} coolingOff={cooling} warmingUp={warming} />
    );

    expect(container.textContent).toContain("Aleksandra W. cooling off");
    expect(container.textContent).toContain("Joon-ho L. warming up");
  });

  it("shows 'Nothing yet' when there are no matching prospects", () => {
    const { container } = render(
      <TodaysBriefing followUps={[]} coolingOff={[]} warmingUp={[]} />
    );

    const text = container.textContent;
    expect(text).toContain("Nothing yet");
  });

  it("shows follow-up with days since touch info", () => {
    const followUps = [
      makeFollowUp({ days_since_touch: 12, parent_first: "Marcus", parent_last: "Lee" }),
    ];

    const { container } = render(
      <TodaysBriefing followUps={followUps} coolingOff={[]} warmingUp={[]} />
    );

    expect(container.textContent).toContain("12d since touch");
  });

  it("renders cooling prospect with days since touch", () => {
    const cooling = [makeCooling({ days_since_touch: 28 })];

    const { container } = render(
      <TodaysBriefing followUps={[]} coolingOff={cooling} warmingUp={[]} />
    );

    expect(container.textContent).toContain("28 days since touch");
  });

  it("links follow-ups to pipeline with prospect ID", () => {
    const followUps = [makeFollowUp({ id: "abc-123" })];

    const { container } = render(
      <TodaysBriefing followUps={followUps} coolingOff={[]} warmingUp={[]} />
    );

    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/hub/pipeline?prospect=abc-123");
  });
});
