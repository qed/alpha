import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  LeaderboardGrid,
  type GeographyCard,
} from "@/components/admin/leaderboard-grid";

function makeGeo(overrides: Partial<GeographyCard> = {}): GeographyCard {
  return {
    id: crypto.randomUUID(),
    slug: "test-city",
    name: "Test City",
    status: "pre-launch",
    enrolledCount: 0,
    totalChildren: 0,
    championName: null,
    ...overrides,
  };
}

describe("LeaderboardGrid", () => {
  it("pre-launch geographies grouped first, sorted by enrollment count descending", () => {
    const geos = [
      makeGeo({ name: "Low", slug: "low", status: "pre-launch", enrolledCount: 5 }),
      makeGeo({ name: "High", slug: "high", status: "pre-launch", enrolledCount: 20 }),
      makeGeo({ name: "Mid", slug: "mid", status: "pre-launch", enrolledCount: 10 }),
    ];
    const { container } = render(<LeaderboardGrid geographies={geos} />);

    const sections = container.querySelectorAll("section");
    const preLaunchSection = sections[0];
    const cards = preLaunchSection.querySelectorAll("a");
    expect(cards[0].textContent).toContain("High");
    expect(cards[1].textContent).toContain("Mid");
    expect(cards[2].textContent).toContain("Low");
  });

  it("existing campuses in separate section below", () => {
    const geos = [
      makeGeo({ name: "Pre", status: "pre-launch" }),
      makeGeo({ name: "Existing", status: "existing-campus" }),
    ];
    const { container } = render(<LeaderboardGrid geographies={geos} />);

    const sections = container.querySelectorAll("section");
    expect(sections[0].textContent).toContain("Pre-Launch");
    expect(sections[0].textContent).toContain("Pre");
    expect(sections[1].textContent).toContain("Active & Existing");
    expect(sections[1].textContent).toContain("Existing");
  });

  it("each geography shows progress bar with enrollment count", () => {
    const geos = [
      makeGeo({ name: "Austin", enrolledCount: 12, totalChildren: 30 }),
    ];
    const { container } = render(<LeaderboardGrid geographies={geos} />);
    expect(container.textContent).toContain("12 / 25");
    expect(container.textContent).toContain("30 children");
  });

  it("geography card links to drill-down view", () => {
    const geos = [makeGeo({ slug: "dallas", name: "Dallas" })];
    const { container } = render(<LeaderboardGrid geographies={geos} />);

    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/geography/dallas");
  });
});
