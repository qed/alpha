import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockAuth = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return <img {...rest} data-fill={fill ? "true" : undefined} data-priority={priority ? "true" : undefined} />;
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

    it("renders the welcome page with hero heading", async () => {
      const page = await HubPage();
      render(page);
      expect(
        screen.getByText("Alpha Parents Hub.", { exact: false })
      ).toBeInTheDocument();
    });

    it("renders the value proposition section", async () => {
      const page = await HubPage();
      render(page);
      expect(
        screen.getByText("You believe in Alpha School")
      ).toBeInTheDocument();
    });

    it("renders three tool preview cards", async () => {
      const page = await HubPage();
      render(page);
      expect(screen.getByText("FAQ Library")).toBeInTheDocument();
      expect(screen.getByText("Parent Testimonials")).toBeInTheDocument();
      expect(
        screen.getByText(/Why Alpha.*Talking Points/i)
      ).toBeInTheDocument();
    });

    it("renders the leader framing section", async () => {
      const page = await HubPage();
      render(page);
      expect(
        screen.getByText("Become a champion for your community")
      ).toBeInTheDocument();
    });

    it("renders Enter the Hub CTAs linking to /hub/sign-in", async () => {
      const page = await HubPage();
      render(page);
      const ctas = screen.getAllByText("Enter the Hub");
      expect(ctas.length).toBeGreaterThanOrEqual(2);
      for (const cta of ctas) {
        expect(cta.closest("a")).toHaveAttribute("href", "/hub/sign-in");
      }
    });

    it("renders the PublicNavbar", async () => {
      const page = await HubPage();
      render(page);
      expect(screen.getByText("Parents Hub")).toBeInTheDocument();
      expect(screen.getByText("The Hub")).toBeInTheDocument();
    });
  });

  describe("authenticated users", () => {
    it("redirects admin to /hub/leaderboard", async () => {
      mockAuth.mockResolvedValue({
        userId: "user_admin",
        sessionClaims: { role: "admin" },
      });

      await expect(HubPage()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/hub/leaderboard");
    });

    it("redirects champion to /hub/dashboard", async () => {
      mockAuth.mockResolvedValue({
        userId: "user_champion",
        sessionClaims: { role: "champion" },
      });

      await expect(HubPage()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/hub/dashboard");
    });

    it("redirects user with no role to /hub/dashboard (defaults to champion)", async () => {
      mockAuth.mockResolvedValue({
        userId: "user_norole",
        sessionClaims: {},
      });

      await expect(HubPage()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/hub/dashboard");
    });
  });
});
