import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockAuth = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/hub",
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return (
      <img
        {...rest}
        data-fill={fill ? "true" : undefined}
        data-priority={priority ? "true" : undefined}
      />
    );
  },
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

import HubPage from "@/app/hub/page";

describe("HubPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("unauthenticated visitors", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });
    });

    it("renders the intro page with hero heading", async () => {
      const page = await HubPage();
      render(page);
      expect(screen.getByText("Alpha Champions Hub")).toBeInTheDocument();
    });

    it("renders the tagline", async () => {
      const page = await HubPage();
      render(page);
      expect(
        screen.getByText(
          "Tools and resources to champion Alpha School in your community."
        )
      ).toBeInTheDocument();
    });

    it("renders three tool preview cards linking to library", async () => {
      const page = await HubPage();
      render(page);
      expect(screen.getByText("FAQ Library")).toBeInTheDocument();
      expect(screen.getByText("Parent Testimonials")).toBeInTheDocument();
      expect(
        screen.getByText(/Why Alpha.*Talking Points/i)
      ).toBeInTheDocument();
    });

    it("renders the CTA with Enter the Hub for unauthenticated", async () => {
      const page = await HubPage();
      render(page);
      const cta = screen.getByText("Enter the Hub");
      expect(cta.closest("a")).toHaveAttribute("href", "/hub/sign-in");
    });

    it("renders the sidebar with nav items", async () => {
      const page = await HubPage();
      render(page);
      expect(screen.getByText("Intro")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Pipeline")).toBeInTheDocument();
      expect(screen.getByText("Library")).toBeInTheDocument();
      expect(screen.getByText("Events")).toBeInTheDocument();
      expect(screen.getByText("My Page")).toBeInTheDocument();
    });

    it("renders the Alpha Toronto callout in welcome content", async () => {
      const page = await HubPage();
      render(page);
      const links = screen.getAllByText("alphatoronto.org");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the short CTA (10 words or fewer)", async () => {
      const page = await HubPage();
      render(page);
      const cta = screen.getByText("Ready? Start championing Alpha.");
      const words = cta.textContent!.split(/\s+/).filter(Boolean);
      expect(words.length).toBeLessThanOrEqual(10);
    });
  });

  describe("authenticated champion", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        userId: "user_champion",
        sessionClaims: { role: "champion" },
      });
    });

    it("renders the intro page (no redirect to dashboard)", async () => {
      const page = await HubPage();
      render(page);
      expect(screen.getByText("Alpha Champions Hub")).toBeInTheDocument();
    });

    it("renders Go to Dashboard CTA for authenticated users", async () => {
      const page = await HubPage();
      render(page);
      const cta = screen.getByText("Go to Dashboard");
      expect(cta.closest("a")).toHaveAttribute("href", "/hub/dashboard");
    });
  });

  describe("authenticated admin", () => {
    it("renders the intro page (no redirect to leaderboard)", async () => {
      mockAuth.mockResolvedValue({
        userId: "user_admin",
        sessionClaims: { role: "admin" },
      });
      const page = await HubPage();
      render(page);
      expect(screen.getByText("Alpha Champions Hub")).toBeInTheDocument();
    });
  });

  describe("authenticated user with no geography", () => {
    it("renders the intro page without errors", async () => {
      mockAuth.mockResolvedValue({
        userId: "user_nogeo",
        sessionClaims: { role: "champion" },
      });
      const page = await HubPage();
      render(page);
      expect(screen.getByText("Alpha Champions Hub")).toBeInTheDocument();
    });
  });
});
