import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { CopilotCard } from "@/components/dashboard/copilot-card";
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
    last_touch_at: "2026-04-29T12:00:00Z",
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

describe("CopilotCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-02T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "Conversation Co-pilot" heading text', () => {
    const { container } = render(
      <CopilotCard prospect={makeProspect()} />
    );

    expect(container.textContent).toContain("Conversation Co-pilot");
  });

  it("renders briefing text containing days since last touch info", () => {
    // last_touch_at is 2026-04-29, system time is 2026-05-02 => 3 days
    const { container } = render(
      <CopilotCard
        prospect={makeProspect({ last_touch_at: "2026-04-29T12:00:00Z" })}
      />
    );

    expect(container.textContent).toContain("3 days since last touch");
  });

  it("renders next move recommendation text from the rules engine", () => {
    // Prospect with concerns ["tuition"] and empty sentConcerns => rule 3 fires
    const { container } = render(
      <CopilotCard
        prospect={makeProspect({
          concerns: ["tuition"],
          engagement_signals: ["faq"],
        })}
      />
    );

    expect(container.textContent).toContain(
      'Send an answer addressing "Tuition" concern.'
    );
  });

  it("suppresses rule 3 when concern has been addressed via library send", () => {
    const { container } = render(
      <CopilotCard
        prospect={makeProspect({
          concerns: ["tuition"],
          engagement_signals: ["faq"],
          librarySends: [
            {
              id: "send-1",
              library_item_id: "item-1",
              concern: "tuition",
              channel: "in-app",
              sent_at: "2026-05-01T12:00:00Z",
            },
          ],
        })}
      />
    );

    expect(container.textContent).not.toContain(
      'Send an answer addressing "Tuition" concern.'
    );
  });

  it('shows "New prospect" empty state when prospect has no concerns AND no signals', () => {
    const { container } = render(
      <CopilotCard
        prospect={makeProspect({
          concerns: [],
          engagement_signals: [],
        })}
      />
    );

    expect(container.textContent).toContain(
      "New prospect — update concerns and signals to get recommendations."
    );
  });
});
