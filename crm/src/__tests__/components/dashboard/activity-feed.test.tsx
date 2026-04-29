import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import {
  ActivityFeed,
  type ActivityItem,
} from "@/components/dashboard/activity-feed";

function makeItem(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: crypto.randomUUID(),
    action: "prospect-create",
    created_at: new Date().toISOString(),
    metadata: null,
    prospect_name: "Jane Doe",
    ...overrides,
  };
}

describe("ActivityFeed", () => {
  it("new signups appear at top of feed", () => {
    const items = [
      makeItem({
        id: "1",
        prospect_name: "First",
        created_at: new Date().toISOString(),
      }),
      makeItem({
        id: "2",
        prospect_name: "Second",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }),
    ];
    const { container } = render(<ActivityFeed items={items} />);
    const listItems = container.querySelectorAll("li");
    expect(listItems[0].textContent).toContain("First");
    expect(listItems[1].textContent).toContain("Second");
  });

  it("status changes show new status badge", () => {
    const items = [
      makeItem({
        action: "status-change",
        prospect_name: "Jane Doe",
        metadata: { old_status: "interested", new_status: "shadow-day" },
      }),
    ];
    const { container } = render(<ActivityFeed items={items} />);
    const text = container.querySelector("li")?.textContent;
    expect(text).toContain("Jane Doe");
    expect(text).toContain("moved to");
    expect(text).toContain("Shadow Day");
  });

  it("feed paginates at 20 items", () => {
    const items = Array.from({ length: 25 }, (_, i) =>
      makeItem({ id: `item-${i}`, prospect_name: `Family ${i}` })
    );
    const { container } = render(<ActivityFeed items={items} pageSize={20} />);
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(20);

    const showMoreBtn = container.querySelector("button");
    expect(showMoreBtn?.textContent).toContain("Show more");
    fireEvent.click(showMoreBtn!);
    const allItems = container.querySelectorAll("li");
    expect(allItems.length).toBe(25);
  });

  it("shows empty message when no items", () => {
    const { container } = render(<ActivityFeed items={[]} />);
    expect(container.textContent).toContain("No activity yet");
  });
});
