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

import { SendComposer } from "@/components/dashboard/send-composer";

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

function makeLibraryItem(overrides: Partial<{
  id: string;
  title: string;
  body: string;
  type: string;
}> = {}) {
  return {
    id: "lib-item-1",
    title: "Test FAQ",
    body: "This is test body content for the FAQ item.",
    type: "faq",
    ...overrides,
  };
}

function makeProspect(overrides: Partial<{
  id: string;
  parent_first: string;
  parent_last: string;
  email: string | null;
}> = {}) {
  return {
    id: "prospect-1",
    parent_first: "Jane",
    parent_last: "Doe",
    email: "jane@example.com",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SendComposer", () => {
  const onClose = vi.fn();
  const defaultItem = makeLibraryItem();
  const defaultProspect = makeProspect();
  const defaultProspects = [
    defaultProspect,
    makeProspect({ id: "prospect-2", parent_first: "Bob", parent_last: "Smith", email: "bob@example.com" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecordLibrarySend.mockResolvedValue({ success: true });

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders with pre-filled contact when prospect is provided", () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    // To field should show prospect info as read-only
    const toInput = screen.getByDisplayValue(/Jane Doe/);
    expect(toInput).toBeInTheDocument();
    expect(toInput).toHaveAttribute("readOnly");
  });

  it("channel toggle switches active channel", () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    // Email should be active by default
    const emailBtn = screen.getByTestId("channel-email");
    const smsBtn = screen.getByTestId("channel-sms");

    expect(emailBtn.className).toContain("bg-ink");
    expect(smsBtn.className).not.toContain("bg-ink");

    // Click SMS
    fireEvent.click(smsBtn);
    expect(smsBtn.className).toContain("bg-ink");
    expect(emailBtn.className).not.toContain("bg-ink");
  });

  it("subject field hidden for non-email channels", () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    // Subject visible for email (default)
    expect(screen.getByTestId("subject-field")).toBeInTheDocument();

    // Switch to SMS
    fireEvent.click(screen.getByTestId("channel-sms"));
    expect(screen.queryByTestId("subject-field")).not.toBeInTheDocument();

    // Switch to WhatsApp
    fireEvent.click(screen.getByTestId("channel-whatsapp"));
    expect(screen.queryByTestId("subject-field")).not.toBeInTheDocument();

    // Switch back to email
    fireEvent.click(screen.getByTestId("channel-email"));
    expect(screen.getByTestId("subject-field")).toBeInTheDocument();
  });

  it("clicking Send & log calls recordLibrarySend with correct params", async () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId("send-and-log-btn"));

    await waitFor(() => {
      expect(mockRecordLibrarySend).toHaveBeenCalledWith({
        prospect_id: "prospect-1",
        library_item_id: "lib-item-1",
        channel: "email",
        auto_log_signal: true,
      });
    });
  });

  it("copies message to clipboard on successful send", async () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId("send-and-log-btn"));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        "Copied to clipboard & logged!",
        "success"
      );
    });
  });

  it("shows degraded toast when clipboard fails", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")) },
    });

    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId("send-and-log-btn"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Logged! (clipboard not available)",
        "success"
      );
    });
  });

  it("calls onClose and router.refresh on success", async () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId("send-and-log-btn"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error toast on failed send", async () => {
    mockRecordLibrarySend.mockResolvedValue({
      success: false,
      error: "Access denied.",
    });

    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId("send-and-log-btn"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Access denied.", "error");
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("clicking backdrop calls onClose", () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId("send-composer-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("auto-log checkbox defaults to checked and can be unchecked", () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospect={defaultProspect}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    const checkbox = screen.getByTestId("auto-log-checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it("send button disabled when no prospect selected", () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    const sendBtn = screen.getByTestId("send-and-log-btn");
    expect(sendBtn).toBeDisabled();
  });

  it("typeahead search filters prospects by name", () => {
    render(
      <SendComposer
        libraryItem={defaultItem}
        prospects={defaultProspects}
        onClose={onClose}
      />
    );

    const input = screen.getByTestId("send-composer-to-input");
    fireEvent.change(input, { target: { value: "Bob" } });

    // Should show Bob Smith in dropdown
    expect(screen.getByText(/Bob Smith/)).toBeInTheDocument();
    // Should not show Jane Doe
    expect(screen.queryByText(/Jane Doe/)).not.toBeInTheDocument();
  });
});
