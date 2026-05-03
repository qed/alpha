import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Module-level mocks (hoisted before imports)
// ---------------------------------------------------------------------------

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

const mockRecordLibrarySend = vi.fn();

vi.mock("@/lib/actions/pipeline", () => ({
  recordLibrarySend: (...args: unknown[]) => mockRecordLibrarySend(...args),
}));

const mockShowToast = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { LibrarySendPanel } from "@/components/dashboard/library-send-panel";
import { CONCERN_LABELS, type Concern } from "@/lib/constants/pipeline";
import type {
  LibraryItem,
  DrawerLibrarySend,
} from "@/components/dashboard/contact-drawer";

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

function makeLibraryItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    id: crypto.randomUUID(),
    type: "faq",
    title: "Test FAQ Item",
    body: "This is the body content.",
    concern: "tuition",
    ...overrides,
  };
}

function makeLibrarySend(
  overrides: Partial<DrawerLibrarySend> = {}
): DrawerLibrarySend {
  return {
    id: crypto.randomUUID(),
    library_item_id: "item-1",
    concern: "tuition",
    channel: "in-app",
    sent_at: "2026-05-01T12:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LibrarySendPanel", () => {
  const prospectId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecordLibrarySend.mockResolvedValue({ success: true });
  });

  it("renders library items grouped by concern sections with correct headers", () => {
    const tuitionItem = makeLibraryItem({
      concern: "tuition",
      title: "Tuition FAQ",
    });
    const paceItem = makeLibraryItem({
      concern: "pace",
      title: "Pace FAQ",
    });

    render(
      <LibrarySendPanel
        libraryItems={[tuitionItem, paceItem]}
        librarySends={[]}
        prospectConcerns={["tuition", "pace", "screen-time", "socialization", "accreditation", "transcripts", "religion", "spouse-buy-in"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    // Verify section headers use CONCERN_LABELS
    expect(
      screen.getByText(CONCERN_LABELS["tuition" as Concern])
    ).toBeInTheDocument();
    expect(
      screen.getByText(CONCERN_LABELS["pace" as Concern])
    ).toBeInTheDocument();
  });

  it("only shows accordion headers matching the prospect's concerns", () => {
    const tuitionItem = makeLibraryItem({ concern: "tuition", title: "Tuition FAQ" });
    const paceItem = makeLibraryItem({ concern: "pace", title: "Pace FAQ" });
    const socialItem = makeLibraryItem({ concern: "socialization", title: "Social FAQ" });

    render(
      <LibrarySendPanel
        libraryItems={[tuitionItem, paceItem, socialItem]}
        librarySends={[]}
        prospectConcerns={["tuition", "pace"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    expect(screen.getByText(CONCERN_LABELS["tuition" as Concern])).toBeInTheDocument();
    expect(screen.getByText(CONCERN_LABELS["pace" as Concern])).toBeInTheDocument();
    expect(screen.queryByText(CONCERN_LABELS["socialization" as Concern])).not.toBeInTheDocument();
  });

  it("expanding an accordion reveals item title, type badge, and body", () => {
    const item = makeLibraryItem({
      title: "Financial Aid Overview",
      type: "talking",
      body: "We offer flexible payment plans.",
    });

    render(
      <LibrarySendPanel
        libraryItems={[item]}
        librarySends={[]}
        prospectConcerns={["tuition"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    // Items hidden by default
    expect(screen.queryByText("Financial Aid Overview")).not.toBeInTheDocument();

    // Click accordion to expand
    fireEvent.click(screen.getByText(CONCERN_LABELS["tuition" as Concern]));

    expect(screen.getByText("Financial Aid Overview")).toBeInTheDocument();
    expect(screen.getByText("Talking Point")).toBeInTheDocument();
    expect(
      screen.getByText("We offer flexible payment plans.")
    ).toBeInTheDocument();
  });

  it('clicking "Mark as sent" calls recordLibrarySend with correct prospect_id and library_item_id', async () => {
    const item = makeLibraryItem({ id: "lib-item-42", concern: "tuition" });

    render(
      <LibrarySendPanel
        libraryItems={[item]}
        librarySends={[]}
        prospectConcerns={["tuition"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(CONCERN_LABELS["tuition" as Concern]));
    const btn = screen.getByRole("button", { name: "Mark as sent" });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockRecordLibrarySend).toHaveBeenCalledWith({
        prospect_id: prospectId,
        library_item_id: "lib-item-42",
      });
    });
  });

  it('after marking as sent, button shows "Sent" and is disabled', async () => {
    const item = makeLibraryItem({ concern: "tuition" });

    render(
      <LibrarySendPanel
        libraryItems={[item]}
        librarySends={[]}
        prospectConcerns={["tuition"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(CONCERN_LABELS["tuition" as Concern]));
    const btn = screen.getByRole("button", { name: "Mark as sent" });
    fireEvent.click(btn);

    await waitFor(() => {
      // The button text includes a checkmark: "Sent ✓"
      const sentBtn = screen.getByRole("button", { name: /Sent/ });
      expect(sentBtn).toBeDisabled();
    });
  });

  it('items already in librarySends render as "Sent" (disabled) initially', () => {
    const item = makeLibraryItem({ id: "already-sent-item", concern: "pace" });
    const send = makeLibrarySend({ library_item_id: "already-sent-item" });

    render(
      <LibrarySendPanel
        libraryItems={[item]}
        librarySends={[send]}
        prospectConcerns={["pace"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(CONCERN_LABELS["pace" as Concern]));
    const sentBtn = screen.getByRole("button", { name: /Sent/ });
    expect(sentBtn).toBeDisabled();
  });

  it("shows empty state when prospect has no concerns", () => {
    render(
      <LibrarySendPanel
        libraryItems={[makeLibraryItem({ concern: "tuition" })]}
        librarySends={[]}
        prospectConcerns={[]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    expect(
      screen.getByText(/No concerns recorded/)
    ).toBeInTheDocument();
  });

  it("shows empty state when all library items have null concern", () => {
    const item = makeLibraryItem({ concern: null });

    render(
      <LibrarySendPanel
        libraryItems={[item]}
        librarySends={[]}
        prospectConcerns={["tuition"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    expect(
      screen.getByText(/No concerns recorded/)
    ).toBeInTheDocument();
  });

  it("clicking backdrop calls onClose", () => {
    render(
      <LibrarySendPanel
        libraryItems={[makeLibraryItem()]}
        librarySends={[]}
        prospectConcerns={["tuition", "pace", "screen-time", "socialization", "accreditation", "transcripts", "religion", "spouse-buy-in"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    const backdrop = screen.getByTestId("library-panel-backdrop");
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("clicking close button calls onClose", () => {
    render(
      <LibrarySendPanel
        libraryItems={[makeLibraryItem()]}
        librarySends={[]}
        prospectConcerns={["tuition", "pace", "screen-time", "socialization", "accreditation", "transcripts", "religion", "spouse-buy-in"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls router.refresh() after successful send", async () => {
    const item = makeLibraryItem({ concern: "tuition" });

    render(
      <LibrarySendPanel
        libraryItems={[item]}
        librarySends={[]}
        prospectConcerns={["tuition"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(CONCERN_LABELS["tuition" as Concern]));
    const btn = screen.getByRole("button", { name: "Mark as sent" });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledOnce();
    });
  });

  it("reverts button state and shows error toast on failed send", async () => {
    mockRecordLibrarySend.mockResolvedValue({
      success: false,
      error: "Access denied.",
    });

    const item = makeLibraryItem({ concern: "tuition" });

    render(
      <LibrarySendPanel
        libraryItems={[item]}
        librarySends={[]}
        prospectConcerns={["tuition"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(CONCERN_LABELS["tuition" as Concern]));
    const btn = screen.getByRole("button", { name: "Mark as sent" });
    fireEvent.click(btn);

    await waitFor(() => {
      // Button should revert to "Mark as sent" and be enabled again
      const revertedBtn = screen.getByRole("button", { name: "Mark as sent" });
      expect(revertedBtn).not.toBeDisabled();
    });

    expect(mockShowToast).toHaveBeenCalledWith("Access denied.", "error");
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("renders all four type badge labels correctly", () => {
    const items = [
      makeLibraryItem({ type: "faq", title: "FAQ Item", concern: "tuition" }),
      makeLibraryItem({
        type: "talking",
        title: "Talking Item",
        concern: "tuition",
      }),
      makeLibraryItem({
        type: "data",
        title: "Data Item",
        concern: "tuition",
      }),
      makeLibraryItem({
        type: "quote",
        title: "Quote Item",
        concern: "tuition",
      }),
    ];

    render(
      <LibrarySendPanel
        libraryItems={items}
        librarySends={[]}
        prospectConcerns={["tuition"]}
        prospectId={prospectId}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(CONCERN_LABELS["tuition" as Concern]));

    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("Talking Point")).toBeInTheDocument();
    expect(screen.getByText("Data Point")).toBeInTheDocument();
    expect(screen.getByText("Quote")).toBeInTheDocument();
  });
});
