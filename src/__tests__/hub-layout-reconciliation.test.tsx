import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockRequireAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockGeographies = [
  { id: "geo-1", name: "Austin", region: "Texas", country: "US" },
];

vi.mock("@/lib/queries/geographies", () => ({
  getAvailableGeographies: () => Promise.resolve(mockGeographies),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { reload: vi.fn().mockResolvedValue(undefined) } }),
}));

vi.mock("@/lib/actions/geography-selection", () => ({
  selectGeography: vi.fn(),
  createGeography: vi.fn(),
}));

import DashboardLayout from "@/app/hub/(dashboard)/layout";

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with geography", () => {
    beforeEach(() => {
      mockRequireAuth.mockResolvedValue({
        userId: "user_1",
        profileId: "profile-1",
        role: "champion",
        geographyId: "geo-1",
      });
    });

    it("renders children without a header element", async () => {
      const layout = await DashboardLayout({
        children: <div data-testid="child">Dashboard content</div>,
      });
      const { container } = render(layout);
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(container.querySelector("header")).toBeNull();
    });

    it("does not render UserButton", async () => {
      const layout = await DashboardLayout({
        children: <div>Content</div>,
      });
      render(layout);
      expect(screen.queryByText("UserButton")).not.toBeInTheDocument();
    });
  });

  describe("without geography", () => {
    beforeEach(() => {
      mockRequireAuth.mockResolvedValue({
        userId: "user_1",
        profileId: "profile-1",
        role: "champion",
        geographyId: null,
      });
    });

    it("renders GeographyPicker without a header element", async () => {
      const layout = await DashboardLayout({
        children: <div>Should not appear</div>,
      });
      const { container } = render(layout);
      expect(screen.getByText("Austin")).toBeInTheDocument();
      expect(container.querySelector("header")).toBeNull();
    });
  });
});
