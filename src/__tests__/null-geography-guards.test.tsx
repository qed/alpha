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

const mockGeographies = [
  { id: "geo-1", name: "Austin", region: "Texas", country: "US" },
];

vi.mock("@/lib/queries/geographies", () => ({
  getAvailableGeographies: () => Promise.resolve(mockGeographies),
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

vi.mock("@/components/dashboard/new-prospect-form", () => ({
  NewProspectForm: () => <div>NewProspectForm</div>,
}));

import DashboardPage from "@/app/hub/(dashboard)/(champion)/dashboard/page";
import ProspectsPage from "@/app/hub/(dashboard)/(champion)/prospects/page";
import ProspectDetailPage from "@/app/hub/(dashboard)/(champion)/prospects/[id]/page";
import NewProspectPage from "@/app/hub/(dashboard)/(champion)/prospects/new/page";

describe("null geography guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dashboard page", () => {
    it("shows GeographyPicker when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await DashboardPage();
      render(page);
      expect(screen.getByText("Select your geography")).toBeInTheDocument();
      expect(screen.getByText("Austin")).toBeInTheDocument();
    });
  });

  describe("prospects page", () => {
    it("shows GeographyPicker when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await ProspectsPage();
      render(page);
      expect(screen.getByText("Select your geography")).toBeInTheDocument();
    });
  });

  describe("prospect detail page", () => {
    it("shows GeographyPicker when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await ProspectDetailPage({
        params: Promise.resolve({ id: "test-id" }),
      });
      render(page);
      expect(screen.getByText("Select your geography")).toBeInTheDocument();
    });
  });

  describe("new prospect page", () => {
    it("shows GeographyPicker when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await NewProspectPage();
      render(page);
      expect(screen.getByText("Select your geography")).toBeInTheDocument();
    });

    it("shows form when geographyId is set", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: "geo-1",
      });

      const page = await NewProspectPage();
      render(page);
      expect(screen.getByText("NewProspectForm")).toBeInTheDocument();
    });
  });
});
