import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/hub/library",
}));

const mockShowToast = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("@/lib/actions/pipeline", () => ({
  recordLibrarySend: vi.fn().mockResolvedValue({ success: true }),
}));

import { LibraryAccordion } from "@/components/hub/library-accordion";
import type { LibraryItem } from "@/components/hub/library-accordion";

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    id: crypto.randomUUID(),
    type: "faq",
    title: "Test FAQ Title",
    body: "This is test FAQ body content.",
    author: null,
    concern: null,
    send_count: 0,
    ...overrides,
  };
}

const defaultProspects = [
  { id: "p1", parent_first: "Jane", parent_last: "Doe", email: "jane@test.com" },
  { id: "p2", parent_first: "Bob", parent_last: "Smith", email: null },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LibraryAccordion (DB-backed)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DB-backed items as cards in accordion groups", () => {
    const items = [
      makeItem({ type: "faq", title: "FAQ Item 1" }),
      makeItem({ type: "quote", title: "Quote Item", body: "Great school", author: "Parent A" }),
      makeItem({ type: "talking", title: "Talking Point 1" }),
    ];

    render(<LibraryAccordion items={items} prospects={defaultProspects} />);

    // Check that groups render
    expect(screen.getByText(/FAQ/)).toBeInTheDocument();
    expect(screen.getByText(/Testimonial/)).toBeInTheDocument();
    expect(screen.getByText(/Talking Point/)).toBeInTheDocument();
  });

  it("testimonial cards use editorial italic styling", () => {
    const items = [
      makeItem({
        type: "quote",
        title: "Quote",
        body: "Alpha changed our lives",
        author: "Test Parent",
      }),
    ];

    render(<LibraryAccordion items={items} prospects={defaultProspects} />);

    // Expand testimonial group
    const testimonialBtn = screen.getByRole("button", { name: /Testimonial/i });
    fireEvent.click(testimonialBtn);

    // Check for italic editorial text
    const quoteText = screen.getByText(/Alpha changed our lives/);
    expect(quoteText.className).toContain("italic");
    expect(quoteText.className).toContain("font-[family-name:var(--font-editorial)]");
  });

  it("clicking Send opens SendComposer", () => {
    const items = [makeItem({ type: "faq", title: "My FAQ" })];

    render(<LibraryAccordion items={items} prospects={defaultProspects} />);

    // Expand FAQ group
    const faqBtn = screen.getByRole("button", { name: /FAQ/i });
    fireEvent.click(faqBtn);

    // Click Send button
    const sendBtn = screen.getByText("Send →");
    fireEvent.click(sendBtn);

    // SendComposer should be open (check for dialog)
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Send from library")).toBeInTheDocument();
  });

  it("empty library shows graceful 'No items yet' state", () => {
    render(<LibraryAccordion items={[]} prospects={defaultProspects} />);

    expect(screen.getByTestId("library-empty")).toBeInTheDocument();
    expect(screen.getByText("No items yet")).toBeInTheDocument();
  });

  it("groups items by type and shows count", () => {
    const items = [
      makeItem({ type: "faq", title: "FAQ 1" }),
      makeItem({ type: "faq", title: "FAQ 2" }),
      makeItem({ type: "data", title: "Data Item 1" }),
    ];

    render(<LibraryAccordion items={items} prospects={defaultProspects} />);

    // FAQ group header should show count
    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("accordion starts collapsed and expands on click", () => {
    const items = [makeItem({ type: "faq", title: "Hidden FAQ" })];

    render(<LibraryAccordion items={items} prospects={defaultProspects} />);

    // Items are hidden
    expect(screen.queryByText("Hidden FAQ")).not.toBeInTheDocument();

    // Click FAQ group button
    const faqBtn = screen.getByRole("button", { name: /FAQ/i });
    expect(faqBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(faqBtn);
    expect(faqBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Hidden FAQ")).toBeInTheDocument();
  });

  it("only one group open at a time", () => {
    const items = [
      makeItem({ type: "faq", title: "FAQ Content" }),
      makeItem({ type: "talking", title: "Talking Content" }),
    ];

    render(<LibraryAccordion items={items} prospects={defaultProspects} />);

    const faqBtn = screen.getByRole("button", { name: /FAQ/i });
    const talkingBtn = screen.getByRole("button", { name: /Talking/i });

    fireEvent.click(faqBtn);
    expect(screen.getByText("FAQ Content")).toBeInTheDocument();

    fireEvent.click(talkingBtn);
    expect(screen.queryByText("FAQ Content")).not.toBeInTheDocument();
    expect(screen.getByText("Talking Content")).toBeInTheDocument();
  });
});
