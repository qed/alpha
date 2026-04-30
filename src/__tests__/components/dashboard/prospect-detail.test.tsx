import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  ProspectDetail,
  type ProspectDetailData,
} from "@/components/dashboard/prospect-detail";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/actions/prospects", () => ({
  updateProspectStatus: vi.fn(),
  setFollowUpDate: vi.fn(),
  addNote: vi.fn(),
}));

function makeProspect(
  overrides: Partial<ProspectDetailData> = {}
): ProspectDetailData {
  return {
    id: "p-1",
    parent_first: "Jane",
    parent_last: "Doe",
    parent_email: "jane@example.com",
    parent_phone: "555-1234",
    spouse_name: "John",
    source: "Friend or family",
    status: "interested",
    follow_up_date: "2026-05-15",
    first_responded_at: null,
    created_at: "2026-04-29T12:00:00Z",
    updated_at: "2026-04-29T12:00:00Z",
    children: [
      { id: "c-1", first_name: "Alice", grade: "3", age: 8, gender: "female" },
      { id: "c-2", first_name: "Bob", grade: "K", age: 5, gender: "male" },
    ],
    notes: [
      {
        id: "n-1",
        body: "Called and spoke with parent",
        created_at: "2026-04-29T14:00:00Z",
        author_name: "Champion User",
      },
      {
        id: "n-2",
        body: "Scheduled shadow day",
        created_at: "2026-04-28T10:00:00Z",
        author_name: "Champion User",
      },
    ],
    ...overrides,
  };
}

describe("ProspectDetail", () => {
  it("displays all prospect fields including children", () => {
    const prospect = makeProspect();
    const { container } = render(<ProspectDetail prospect={prospect} />);

    expect(container.textContent).toContain("Jane Doe");
    expect(container.textContent).toContain("jane@example.com");
    expect(container.textContent).toContain("555-1234");
    expect(container.textContent).toContain("John");
    expect(container.textContent).toContain("Friend or family");
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Bob");
    expect(container.textContent).toContain("Children (2)");
  });

  it("status dropdown shows only valid transitions from current status", () => {
    const prospect = makeProspect({ status: "interested" });
    const { container } = render(<ProspectDetail prospect={prospect} />);

    const select = container.querySelector("select") as HTMLSelectElement;
    const options = Array.from(select.options)
      .map((o) => o.value)
      .filter((v) => v !== "");

    expect(options).toContain("shadow-day");
    expect(options).toContain("lost");
    expect(options).not.toContain("enrolled");
    expect(options).not.toContain("committed");
  });

  it("notes appear in reverse chronological order", () => {
    const prospect = makeProspect();
    const { container } = render(<ProspectDetail prospect={prospect} />);

    const noteTexts = Array.from(container.querySelectorAll("li p")).map(
      (el) => el.textContent
    );
    expect(noteTexts[0]).toBe("Called and spoke with parent");
    expect(noteTexts[1]).toBe("Scheduled shadow day");
  });

  it("follow-up date is editable", () => {
    const prospect = makeProspect({ follow_up_date: "2026-06-01" });
    const { container } = render(<ProspectDetail prospect={prospect} />);

    const dateInput = container.querySelector(
      "input[type='date']"
    ) as HTMLInputElement;
    expect(dateInput).toBeTruthy();
    expect(dateInput.value).toBe("2026-06-01");
  });
});
