import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";

Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

describe("CopyLinkButton", () => {
  it("is always visible (renders without conditions)", () => {
    const { container } = render(
      <CopyLinkButton geographySlug="dallas" />
    );
    const btn = container.querySelector("button");
    expect(btn).toBeTruthy();
    expect(btn?.textContent).toContain("Copy Intake Link");
  });

  it("copies the correct geography-specific intake URL", () => {
    const { container } = render(
      <CopyLinkButton geographySlug="dallas" />
    );
    const btn = container.querySelector("button");
    fireEvent.click(btn!);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/dallas")
    );
  });

  it("shows 'Copied!' feedback after click", async () => {
    const { container } = render(
      <CopyLinkButton geographySlug="dallas" />
    );
    const btn = container.querySelector("button");
    fireEvent.click(btn!);

    await vi.waitFor(() => {
      expect(btn?.textContent).toContain("Copied!");
    });
  });
});
