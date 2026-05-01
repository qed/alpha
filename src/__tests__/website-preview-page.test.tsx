import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Sora: () => ({ variable: "mock-sora" }),
  DM_Sans: () => ({ variable: "mock-dm-sans" }),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Cell: () => <div />,
}));

import WebsitePreviewPage from "@/app/hub/library/website-preview/page";

describe("WebsitePreviewPage", () => {
  it("renders without errors", () => {
    render(<WebsitePreviewPage />);
    expect(document.querySelector(".wp-root")).toBeTruthy();
  });

  describe("navbar", () => {
    it("shows Local City brand with logo", () => {
      render(<WebsitePreviewPage />);
      const navText = document.querySelector(".wp-nav-text");
      expect(navText?.textContent).toBe("Local City");
      const logo = document.querySelector(".wp-nav-logo") as HTMLImageElement;
      expect(logo?.tagName).toBe("IMG");
      expect(logo?.alt).toBe("Alpha");
    });

    it("has Join the Discussion link", () => {
      render(<WebsitePreviewPage />);
      const link = document.querySelector(".wp-nav-cta") as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.href).toContain("community.alpha.school");
    });
  });

  describe("footer", () => {
    it("shows Local City name with logo", () => {
      render(<WebsitePreviewPage />);
      const footerName = document.querySelector(".wp-footer-name");
      expect(footerName?.textContent).toBe("Local City");
      const logo = document.querySelector(".wp-footer-logo") as HTMLImageElement;
      expect(logo?.tagName).toBe("IMG");
    });

    it("shows alphalocalcity.org URL", () => {
      render(<WebsitePreviewPage />);
      const footerUrl = document.querySelector(".wp-footer-url");
      expect(footerUrl?.textContent).toBe("alphalocalcity.org");
    });

    it("shows correct copyright", () => {
      render(<WebsitePreviewPage />);
      const copyright = document.querySelector(".wp-footer-copyright");
      expect(copyright?.textContent).toContain("Alpha Local City");
    });
  });

  describe("hero section", () => {
    it("renders headline and stats", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText(/actually prepares/)).toBeInTheDocument();
      expect(screen.getByText("2hrs")).toBeInTheDocument();
      expect(screen.getByText("2.6x")).toBeInTheDocument();
      const stats = document.querySelectorAll(".wp-hero-stat-value");
      const statValues = Array.from(stats).map((s) => s.textContent);
      expect(statValues).toContain("K-8");
    });
  });

  describe("events bar", () => {
    it("shows upcoming events label and portal CTA", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
      expect(
        screen.getByText("View in Community Portal")
      ).toBeInTheDocument();
    });

    it("renders CTA as a blue pill link", () => {
      render(<WebsitePreviewPage />);
      const cta = document.querySelector(".wp-events-bar-cta");
      expect(cta).toBeTruthy();
      expect(cta?.tagName).toBe("A");
    });
  });

  describe("progress tracker", () => {
    it("renders heading and eyebrow", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText("Where We Are")).toBeInTheDocument();
      expect(screen.getByText("Our Progress")).toBeInTheDocument();
    });

    it("renders 4 milestones", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText("Community Portal open")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Accepting Commitments")
      ).toBeInTheDocument();
      expect(screen.getByText("50 Commitments")).toBeInTheDocument();
      expect(
        screen.getByText("Determining Location")
      ).toBeInTheDocument();
    });

    it("shows 3 completed checkmarks and 1 current step", () => {
      render(<WebsitePreviewPage />);
      const checks = document.querySelectorAll(".wp-progress-check");
      const current = document.querySelectorAll(".wp-progress-current");
      expect(checks.length).toBe(3);
      expect(current.length).toBe(1);
    });
  });

  describe("alpha model", () => {
    it("renders eyebrow, heading and subtitle", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText("The Alpha Model")).toBeInTheDocument();
      expect(
        screen.getByText(
          "A completely different approach to education"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/personalized AI-powered learning combined with real-world skill development/)
      ).toBeInTheDocument();
    });

    it("renders 4 feature cards", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText("AI-Powered Personalized Learning")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Entrepreneurship & Life Skills")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Physical & Mental Wellness")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Community & Connection")
      ).toBeInTheDocument();
    });
  });

  describe("video section", () => {
    it("renders YouTube embeds with nocookie domain", () => {
      render(<WebsitePreviewPage />);
      const iframes = document.querySelectorAll("iframe");
      expect(iframes.length).toBeGreaterThanOrEqual(2);
      iframes.forEach((iframe) => {
        expect(iframe.src).toContain("youtube-nocookie.com");
      });
    });

    it("renders videos with lazy loading", () => {
      render(<WebsitePreviewPage />);
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        expect(iframe.getAttribute("loading")).toBe("lazy");
      });
    });
  });

  describe("daily schedule", () => {
    it("renders eyebrow, heading and subtitle", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText("The Daily Experience")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "What does a day at Alpha actually look like?"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/maximize learning, growth, and joy/)
      ).toBeInTheDocument();
    });

    it("renders 4 time blocks", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText("Limitless Launch")).toBeInTheDocument();
      expect(
        screen.getByText("Guided Academic Time")
      ).toBeInTheDocument();
      expect(screen.getByText("Lunch & Wellness")).toBeInTheDocument();
      expect(
        screen.getByText("Life Skills & Enrichment")
      ).toBeInTheDocument();
    });
  });

  describe("enrollment info", () => {
    it("renders eyebrow, heading and subtitle", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText("Practical details for families")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/more details coming as we approach opening/)
      ).toBeInTheDocument();
    });

    it("renders 4 cards with correct values", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText("Grades Served")).toBeInTheDocument();
      expect(
        screen.getByText(/8:45 AM/)
      ).toBeInTheDocument();
      expect(screen.getByText("Fall 2026")).toBeInTheDocument();
    });

    it("uses generic tuition text", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText(
          /committed families first/
        )
      ).toBeInTheDocument();
    });
  });

  describe("coming soon / high school", () => {
    it("renders eyebrow and heading without Los Angeles", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
      const heading = document.querySelector(".wp-coming-soon-heading");
      expect(heading?.textContent).toBe("Alpha High School");
    });

    it("renders both description paragraphs", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText(/extending the same transformative Alpha model/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/launched businesses/)
      ).toBeInTheDocument();
    });

    it("shows SAT score badge and sub-badge", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText("94th Percentile Nationally")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/National avg: 1024/)
      ).toBeInTheDocument();
    });

    it("shows detailed SAT score rows", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText("Overall School Average")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Class of 2025 (Seniors)")
      ).toBeInTheDocument();
    });
  });

  describe("interest chart", () => {
    it("renders eyebrow, heading and subtitle", () => {
      render(<WebsitePreviewPage />);
      expect(screen.getByText("Current Interest")).toBeInTheDocument();
      expect(
        screen.getByText("Families Already Raising Their Hands")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/where local families stand today/)
      ).toBeInTheDocument();
    });

    it("renders chart with genericized labels", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText(/Alpha Example City/)
      ).toBeInTheDocument();
    });

    it("renders disclaimer", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText(/not formal commitments/)
      ).toBeInTheDocument();
    });
  });

  describe("CTA section", () => {
    it("renders heading without South Bay", () => {
      render(<WebsitePreviewPage />);
      expect(
        screen.getByText("Ready to be part of something different?")
      ).toBeInTheDocument();
    });
  });

  describe("service areas", () => {
    it("lists 6 generic city names", () => {
      render(<WebsitePreviewPage />);
      const list = document.querySelector(".wp-service-areas-list");
      const text = list?.textContent || "";
      [
        "Center City",
        "City East",
        "City West",
        "City North",
        "City South",
        "City Suburbs",
      ].forEach((city) => {
        expect(text).toContain(city);
      });
    });
  });

  describe("geography audit", () => {
    it("contains no South Bay references", () => {
      render(<WebsitePreviewPage />);
      const text = document.body.textContent || "";
      expect(text).not.toContain("South Bay");
    });

    it("contains no Los Angeles references", () => {
      render(<WebsitePreviewPage />);
      const text = document.body.textContent || "";
      expect(text).not.toContain("Los Angeles");
    });

    it("contains no specific city references", () => {
      render(<WebsitePreviewPage />);
      const text = document.body.textContent || "";
      expect(text).not.toContain("Manhattan Beach");
      expect(text).not.toContain("Hermosa Beach");
      expect(text).not.toContain("Redondo Beach");
      expect(text).not.toContain("Torrance");
    });
  });
});
