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

describe("null geography guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dashboard layout", () => {
    it("shows GeographyPicker when geographyId is null", async () => {
      mockRequireAuth.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const layout = await DashboardLayout({
        children: <div>Dashboard content</div>,
      });
      render(layout);
      expect(screen.getByText("Austin")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument();
    });
  });

  describe("pipeline layout", () => {
    it("shows GeographyPicker when geographyId is null", async () => {
      mockRequireAuth.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const layout = await DashboardLayout({
        children: <div>Pipeline content</div>,
      });
      render(layout);
      expect(screen.getByText("Austin")).toBeInTheDocument();
      expect(screen.queryByText("Pipeline content")).not.toBeInTheDocument();
    });
  });
});
