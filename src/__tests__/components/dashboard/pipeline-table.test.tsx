import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

import {
  PipelineTable,
  type PipelineRow,
} from "@/components/dashboard/pipeline-table";

function makeRow(overrides: Partial<PipelineRow> = {}): PipelineRow {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    parent_first: "Jane",
    parent_last: "Doe",
    parent_email: "jane@example.com",
    parent_phone: null,
    spouse_name: null,
    source: null,
    status: "interested",
    heat_score: 3,
    concerns: [],
    engagement_signals: [],
    last_touch_at: new Date().toISOString(),
    neighborhood: null,
    follow_up_date: null,
    first_responded_at: null,
    consent_given: true,
    consent_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    child_count: 1,
    ...overrides,
  };
}

describe("PipelineTable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-02T12:00:00Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders one row per prospect with name, stage badge, heat, neighborhood, concerns, last touch, and next action columns", () => {
    const prospects = [
      makeRow({
        parent_first: "Alice",
        parent_last: "Smith",
        status: "interested",
        heat_score: 4,
        neighborhood: "Westlake",
        concerns: ["tuition"],
        last_touch_at: "2026-04-30T12:00:00Z",
      }),
      makeRow({
        parent_first: "Bob",
        parent_last: "Jones",
        status: "shadow-day",
        heat_score: 2,
        neighborhood: "Downtown",
        concerns: ["pace", "accreditation"],
        last_touch_at: "2026-04-28T12:00:00Z",
      }),
    ];

    const { container } = render(
      <PipelineTable prospects={prospects} onClearFilters={vi.fn()} />
    );

    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);

    // First row
    expect(rows[0].textContent).toContain("Alice Smith");
    expect(rows[0].textContent).toContain("Interested");
    expect(rows[0].textContent).toContain("Westlake");
    expect(rows[0].textContent).toContain("Tuition");
    expect(rows[0].textContent).toContain("2d ago");

    // Second row
    expect(rows[1].textContent).toContain("Bob Jones");
    expect(rows[1].textContent).toContain("Shadow Day");
    expect(rows[1].textContent).toContain("Downtown");
    expect(rows[1].textContent).toContain("Pace");
    expect(rows[1].textContent).toContain("4d ago");

    // Verify all column headers
    const headers = container.querySelectorAll("thead th");
    const headerTexts = Array.from(headers).map((h) => h.textContent?.trim());
    expect(headerTexts).toEqual(
      expect.arrayContaining([
        "Family",
        "Stage",
        "Heat",
        "Neighborhood",
        "Concerns",
        "Last Touch",
        "Next Action",
      ])
    );
  });

  it("stage badges display correct labels", () => {
    const stages = [
      { status: "interested" as const, label: "Interested" },
      { status: "shadow-day" as const, label: "Shadow Day" },
      { status: "committed" as const, label: "Committed" },
      { status: "enrolled" as const, label: "Enrolled" },
      { status: "lost" as const, label: "Lost" },
    ];

    for (const { status, label } of stages) {
      const { container, unmount } = render(
        <PipelineTable
          prospects={[makeRow({ status })]}
          onClearFilters={vi.fn()}
        />
      );
      const row = container.querySelector("tbody tr");
      expect(row?.textContent).toContain(label);
      unmount();
    }
  });

  it("heat pips render the correct number of filled pips", () => {
    const { container } = render(
      <PipelineTable
        prospects={[makeRow({ heat_score: 3 })]}
        onClearFilters={vi.fn()}
      />
    );

    const pips = container.querySelectorAll("span.w-2.h-2.rounded-full");
    expect(pips).toHaveLength(5);

    const filled = Array.from(pips).filter((p) =>
      p.className.includes("bg-alpha-coral")
    );
    const unfilled = Array.from(pips).filter((p) =>
      p.className.includes("bg-line")
    );
    expect(filled).toHaveLength(3);
    expect(unfilled).toHaveLength(2);
  });

  it("Next Action column shows the copilot engine recommendation text", () => {
    // Prospect with concerns and no sent items => rule 3 fires
    const { container } = render(
      <PipelineTable
        prospects={[
          makeRow({
            status: "interested",
            concerns: ["tuition"],
            last_touch_at: "2026-05-01T12:00:00Z",
          }),
        ]}
        onClearFilters={vi.fn()}
      />
    );

    const row = container.querySelector("tbody tr");
    expect(row?.textContent).toContain(
      'Send a library item addressing "Tuition" concern.'
    );
  });

  it("renders empty state when prospects array is empty", () => {
    const onClearFilters = vi.fn();
    render(
      <PipelineTable prospects={[]} onClearFilters={onClearFilters} />
    );

    expect(
      screen.getByText("No prospects match these filters.")
    ).toBeInTheDocument();
    expect(screen.getByText("Clear filters")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Clear filters"));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it("clicking a table row calls router.push with the prospect id", () => {
    const id = "test-prospect-id-123";
    const { container } = render(
      <PipelineTable
        prospects={[makeRow({ id })]}
        onClearFilters={vi.fn()}
      />
    );

    const row = container.querySelector("tbody tr");
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith(
      `/hub/pipeline?prospect=${id}`
    );
  });
});
