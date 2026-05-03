import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams("prospect=p-1");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/actions/pipeline", () => ({
  overrideHeat: vi.fn(),
  toggleSignal: vi.fn(),
  updateConcerns: vi.fn(),
  addPipelineNote: vi.fn(),
}));

vi.mock("@/lib/actions/prospects", () => ({
  updateProspectStatus: vi.fn(),
}));

import { ContactDrawer } from "@/components/dashboard/contact-drawer";
import type { SelectedProspectDetail } from "@/components/dashboard/contact-drawer";

function makeProspect(
  overrides: Partial<SelectedProspectDetail> = {}
): SelectedProspectDetail {
  return {
    id: "p-1",
    parent_first: "Jane",
    parent_last: "Doe",
    parent_email: "jane@example.com",
    parent_phone: "555-1234",
    spouse_name: null,
    source: null,
    status: "interested",
    heat_score: 3,
    concerns: ["tuition"],
    engagement_signals: ["faq"],
    last_touch_at: new Date().toISOString(),
    neighborhood: null,
    follow_up_date: null,
    first_responded_at: null,
    consent_given: true,
    consent_at: null,
    created_at: "2026-04-20T12:00:00Z",
    updated_at: "2026-04-29T12:00:00Z",
    children: [],
    notes: [],
    statusHistory: [],
    auditEntries: [],
    librarySends: [],
    libraryItems: [],
    ...overrides,
  };
}

describe("ContactDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders element with data-testid="contact-drawer"', () => {
    render(<ContactDrawer prospect={makeProspect()} />);

    expect(screen.getByTestId("contact-drawer")).toBeInTheDocument();
  });

  it("displays the prospect name (parent_first parent_last) in the drawer", () => {
    render(
      <ContactDrawer
        prospect={makeProspect({
          parent_first: "Alice",
          parent_last: "Smith",
        })}
      />
    );

    const drawer = screen.getByTestId("contact-drawer");
    expect(drawer.textContent).toContain("Alice Smith");
  });

  it('close button exists with aria-label="Close drawer"', () => {
    render(<ContactDrawer prospect={makeProspect()} />);

    const closeBtn = screen.getByRole("button", { name: "Close drawer" });
    expect(closeBtn).toBeInTheDocument();
  });

  it("pressing Escape key calls router.push to remove ?prospect param", () => {
    render(<ContactDrawer prospect={makeProspect()} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockPush).toHaveBeenCalledOnce();
    // Should navigate to /hub/pipeline without the prospect param
    const pushedUrl = mockPush.mock.calls[0][0] as string;
    expect(pushedUrl).toContain("/hub/pipeline");
    expect(pushedUrl).not.toContain("prospect=");
  });

  it("clicking close button calls router.push to remove ?prospect param", () => {
    render(<ContactDrawer prospect={makeProspect()} />);

    const closeBtn = screen.getByRole("button", { name: "Close drawer" });
    fireEvent.click(closeBtn);

    expect(mockPush).toHaveBeenCalledOnce();
    const pushedUrl = mockPush.mock.calls[0][0] as string;
    expect(pushedUrl).toContain("/hub/pipeline");
    expect(pushedUrl).not.toContain("prospect=");
  });
});
