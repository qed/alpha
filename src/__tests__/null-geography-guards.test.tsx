import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockRequireAuthenticated = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireChampion: () => mockRequireAuthenticated(),
  requireAuthenticated: () => mockRequireAuthenticated(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => Promise.resolve({}),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a {...props}>{children}</a>,
}));

vi.mock("@/components/dashboard/pipeline-summary", () => ({
  PipelineSummary: () => <div>PipelineSummary</div>,
}));

vi.mock("@/components/dashboard/activity-feed", () => ({
  ActivityFeed: () => <div>ActivityFeed</div>,
}));

vi.mock("@/components/dashboard/empty-state", () => ({
  EmptyState: () => <div>EmptyState</div>,
}));

vi.mock("@/components/dashboard/copy-link-button", () => ({
  CopyLinkButton: () => <div>CopyLinkButton</div>,
}));

vi.mock("@/components/dashboard/prospect-table", () => ({
  ProspectTable: () => <div>ProspectTable</div>,
}));

vi.mock("@/components/dashboard/prospect-detail", () => ({
  ProspectDetail: () => <div>ProspectDetail</div>,
}));

import DashboardPage from "@/app/hub/(dashboard)/(champion)/dashboard/page";
import ProspectsPage from "@/app/hub/(dashboard)/(champion)/prospects/page";
import ProspectDetailPage from "@/app/hub/(dashboard)/(champion)/prospects/[id]/page";

describe("null geography guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dashboard page", () => {
    it("shows pending state when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await DashboardPage();
      render(page);
      expect(screen.getByText("Almost there!")).toBeInTheDocument();
      expect(
        screen.getByText(/geography hasn.t been assigned yet/i)
      ).toBeInTheDocument();
    });
  });

  describe("prospects page", () => {
    it("shows pending state when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await ProspectsPage();
      render(page);
      expect(screen.getByText("Almost there!")).toBeInTheDocument();
    });
  });

  describe("prospect detail page", () => {
    it("shows pending state when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await ProspectDetailPage({
        params: Promise.resolve({ id: "test-id" }),
      });
      render(page);
      expect(screen.getByText("Almost there!")).toBeInTheDocument();
    });
  });
});
