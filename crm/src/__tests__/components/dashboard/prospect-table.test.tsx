import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import {
  ProspectTable,
  type ProspectRow,
} from "@/components/dashboard/prospect-table";

function makeProspect(overrides: Partial<ProspectRow> = {}): ProspectRow {
  return {
    id: crypto.randomUUID(),
    parent_first: "Jane",
    parent_last: "Doe",
    parent_email: "jane@example.com",
    status: "interested",
    follow_up_date: null,
    created_at: new Date().toISOString(),
    child_count: 2,
    ...overrides,
  };
}

describe("ProspectTable", () => {
  it("sort by name toggles on header click", () => {
    const prospects = [
      makeProspect({ parent_first: "Zara", parent_last: "Smith" }),
      makeProspect({ parent_first: "Alice", parent_last: "Brown" }),
    ];
    const { container } = render(<ProspectTable prospects={prospects} />);
    const nameHeader = container.querySelector("th");
    expect(nameHeader?.textContent).toContain("Name");

    fireEvent.click(nameHeader!);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0].textContent).toContain("Alice");
    expect(rows[1].textContent).toContain("Zara");
  });

  it("filter by status shows only matching prospects", () => {
    const prospects = [
      makeProspect({ parent_first: "Jane", status: "interested" }),
      makeProspect({ parent_first: "Bob", status: "enrolled" }),
    ];
    const { container } = render(<ProspectTable prospects={prospects} />);

    const filterBtns = container.querySelectorAll(
      ".flex.gap-1\\.5 button"
    );
    const enrolledBtn = Array.from(filterBtns).find((b) =>
      b.textContent?.includes("enrolled")
    );
    fireEvent.click(enrolledBtn!);

    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain("Bob");
  });

  it("search by parent name (case-insensitive)", () => {
    const prospects = [
      makeProspect({ parent_first: "Jane", parent_last: "Doe", parent_email: "jane@test.com" }),
      makeProspect({ parent_first: "Bob", parent_last: "Smith", parent_email: "bob@test.com" }),
    ];
    const { container } = render(<ProspectTable prospects={prospects} />);

    const searchInput = container.querySelector("input[type='text']") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "jane" } });

    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain("Jane");
  });

  it("search by email (case-insensitive)", () => {
    const prospects = [
      makeProspect({ parent_first: "Jane", parent_email: "jane@test.com" }),
      makeProspect({ parent_first: "Bob", parent_email: "bob@test.com" }),
    ];
    const { container } = render(<ProspectTable prospects={prospects} />);

    const searchInput = container.querySelector("input[type='text']") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "BOB@TEST" } });

    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain("Bob");
  });

  it("shows child count per prospect row", () => {
    const prospects = [makeProspect({ child_count: 3 })];
    const { container } = render(<ProspectTable prospects={prospects} />);

    const row = container.querySelector("tbody tr");
    expect(row?.textContent).toContain("3");
  });

  it("empty search results show 'No prospects found'", () => {
    const prospects = [makeProspect({ parent_first: "Jane" })];
    const { container } = render(<ProspectTable prospects={prospects} />);

    const searchInput = container.querySelector("input[type='text']") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "zzzznotfound" } });

    expect(container.textContent).toContain("No prospects found");
  });
});
