import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/dashboard/empty-state";

Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

describe("EmptyState", () => {
  it("renders when prospect count is zero", () => {
    const { container } = render(
      <EmptyState geographySlug="austin" geographyName="Austin" />
    );
    expect(container.textContent).toContain("Welcome to Austin");
  });

  it("shows onboarding copy and intake URL reference", () => {
    const { container } = render(
      <EmptyState geographySlug="austin" geographyName="Austin" />
    );
    expect(container.textContent).toContain("Share");
    expect(container.textContent).toContain("intake link");
    expect(container.textContent).toContain("Copy Intake Link");
  });

  it("copy-link button copies correct URL to clipboard", async () => {
    const { container } = render(
      <EmptyState geographySlug="austin" geographyName="Austin" />
    );
    const btn = container.querySelector("button");
    fireEvent.click(btn!);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/austin")
    );
  });
});
