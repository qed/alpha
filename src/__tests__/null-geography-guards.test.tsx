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

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [] }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/components/dashboard/pipeline-shell", () => ({
  PipelineShell: () => <div>PipelineShell</div>,
}));

import DashboardPage from "@/app/hub/(dashboard)/(champion)/dashboard/page";
import PipelinePage from "@/app/hub/(dashboard)/(champion)/pipeline/page";

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

  describe("pipeline page", () => {
    it("shows GeographyPicker when geographyId is null", async () => {
      mockRequireAuthenticated.mockResolvedValue({
        userId: "user_1",
        role: "champion",
        geographyId: null,
      });

      const page = await PipelinePage({
        searchParams: Promise.resolve({}),
      });
      render(page);
      expect(screen.getByText("Select your geography")).toBeInTheDocument();
    });
  });
});
