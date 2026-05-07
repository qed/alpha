import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThisWeekStats, type WeeklyStats } from "@/components/dashboard/this-week-stats";

function makeStats(overrides: Partial<WeeklyStats> = {}): WeeklyStats {
  return {
    oneOnOneConversations: 0,
    librarySends: 0,
    stageChanges: 0,
    newContacts: 0,
    ...overrides,
  };
}

describe("ThisWeekStats", () => {
  it("displays correct counts for each metric", () => {
    const stats = makeStats({
      oneOnOneConversations: 4,
      librarySends: 11,
      stageChanges: 3,
      newContacts: 2,
    });

    const { container } = render(<ThisWeekStats stats={stats} />);
    const text = container.textContent!;

    expect(text).toContain("1:1 conversations logged");
    expect(text).toContain("4");
    expect(text).toContain("Library sends");
    expect(text).toContain("11");
    expect(text).toContain("Stage changes");
    expect(text).toContain("3");
    expect(text).toContain("New contacts added");
    expect(text).toContain("2");
  });

  it("shows all zeros when no audit activity this week", () => {
    const stats = makeStats();

    const { container } = render(<ThisWeekStats stats={stats} />);
    const text = container.textContent!;

    // All rows should have 0
    expect(text).toContain("1:1 conversations logged");
    expect(text).toContain("Library sends");
    expect(text).toContain("Stage changes");
    expect(text).toContain("New contacts added");

    // Count occurrences of "0" — should be at least 4 (one per stat)
    const rows = container.querySelectorAll(".font-bold");
    const zeroCount = Array.from(rows).filter(
      (el) => el.textContent?.trim() === "0"
    ).length;
    expect(zeroCount).toBe(4);
  });

  it("renders the 'This week' heading", () => {
    const stats = makeStats();
    const { container } = render(<ThisWeekStats stats={stats} />);
    expect(container.textContent).toContain("This week");
  });

  it("handles large numbers correctly", () => {
    const stats = makeStats({
      oneOnOneConversations: 99,
      librarySends: 150,
      stageChanges: 42,
      newContacts: 25,
    });

    const { container } = render(<ThisWeekStats stats={stats} />);
    expect(container.textContent).toContain("99");
    expect(container.textContent).toContain("150");
    expect(container.textContent).toContain("42");
    expect(container.textContent).toContain("25");
  });
});
