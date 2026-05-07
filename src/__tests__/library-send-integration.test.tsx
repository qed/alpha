import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

const mockRefresh = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/hub/pipeline",
}));

const mockShowToast = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("@/lib/actions/pipeline", () => ({
  recordLibrarySend: vi.fn().mockResolvedValue({ success: true }),
  overrideHeat: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/actions/prospects", () => ({
  updateProspectStatus: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/pipeline/copilot-engine", () => ({
  suggestHeat: () => 3,
}));

vi.mock("@/lib/utils/dates", () => ({
  daysSince: () => 2,
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { DrawerHeader } from "@/components/dashboard/drawer-header";
import type { SelectedProspectDetail } from "@/components/dashboard/contact-drawer";

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

function makeProspectDetail(
  overrides: Partial<SelectedProspectDetail> = {}
): SelectedProspectDetail {
  return {
    id: "prospect-1",
    parent_first: "Jane",
    parent_last: "Doe",
    parent_email: "jane@example.com",
    parent_phone: "555-1234",
    spouse_name: null,
    source: null,
    postal_code: null,
    status: "interested",
    heat_score: 3,
    concerns: ["tuition"],
    engagement_signals: [],
    last_touch_at: new Date().toISOString(),
    neighborhood: "Port Credit",
    follow_up_date: null,
    first_responded_at: null,
    consent_given: true,
    consent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    children: [{ id: "c1", first_name: "Sam", grade: "3", age: 8, gender: "M" }],
    notes: [],
    statusHistory: [],
    auditEntries: [],
    librarySends: [],
    libraryItems: [
      { id: "lib-1", type: "faq", title: "FAQ About Tuition", body: "We offer flexible plans.", concern: "tuition" },
      { id: "lib-2", type: "quote", title: "Parent Quote", body: "Amazing school!", concern: null },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Contact Drawer - Send from library integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("drawer header shows 'Send from library' button", () => {
    render(<DrawerHeader prospect={makeProspectDetail()} />);
    expect(screen.getByText("Send from library")).toBeInTheDocument();
  });

  it("clicking 'Send from library' opens library item picker", () => {
    render(<DrawerHeader prospect={makeProspectDetail()} />);

    fireEvent.click(screen.getByText("Send from library"));

    // Should show library item picker dialog
    expect(screen.getByText("Send from Library")).toBeInTheDocument();
    expect(screen.getByText("FAQ About Tuition")).toBeInTheDocument();
    expect(screen.getByText("Parent Quote")).toBeInTheDocument();
  });

  it("selecting a library item opens SendComposer with prospect pre-filled", () => {
    render(<DrawerHeader prospect={makeProspectDetail()} />);

    // Open picker
    fireEvent.click(screen.getByText("Send from library"));

    // Select a library item
    fireEvent.click(screen.getByText("FAQ About Tuition"));

    // SendComposer should be open with prospect pre-filled
    expect(screen.getByRole("dialog", { name: "Send from library" })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Jane Doe/)).toBeInTheDocument();
  });

  it("shows empty message when no library items available", () => {
    render(<DrawerHeader prospect={makeProspectDetail({ libraryItems: [] })} />);

    fireEvent.click(screen.getByText("Send from library"));

    expect(screen.getByText("No library items available.")).toBeInTheDocument();
  });
});
