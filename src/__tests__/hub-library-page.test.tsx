import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockAuth = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: vi.fn() }),
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
  usePathname: () => "/hub/library",
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

import LibraryPage from "@/app/hub/library/page";
import { LibraryAccordion } from "@/components/hub/library-accordion";
import { VideoLightbox } from "@/components/hub/video-lightbox";

describe("LibraryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = "";
  });

  describe("page shell", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: null });
    });

    it("renders inside HubShell with sidebar navigation", async () => {
      const page = await LibraryPage();
      render(page);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Library");
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Pipeline")).toBeInTheDocument();
    });

    it("renders without redirect for unauthenticated users", async () => {
      const page = await LibraryPage();
      render(page);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Library");
    });

    it("renders for authenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: "user_123" });
      const page = await LibraryPage();
      render(page);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Library");
    });
  });
});

describe("LibraryAccordion", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  describe("accordion behavior", () => {
    it("renders all 4 accordion items with correct labels", () => {
      render(<LibraryAccordion />);
      expect(screen.getByText("FAQ Library")).toBeInTheDocument();
      expect(screen.getByText("Parent Testimonials")).toBeInTheDocument();
      expect(
        screen.getByText("“Why Alpha” Talking Points")
      ).toBeInTheDocument();
      expect(screen.getByText("A full Alpha website")).toBeInTheDocument();
    });

    it("renders website item as a link opening in new tab", () => {
      render(<LibraryAccordion />);
      const link = screen.getByText("A full Alpha website").closest("a");
      expect(link).toHaveAttribute("href", "/hub/library/website-preview");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("starts with all items collapsed", () => {
      render(<LibraryAccordion />);
      const buttons = screen.getAllByRole("button", {
        name: /FAQ Library|Parent Testimonials|Talking Points/i,
      });
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("expands an item when clicked", () => {
      render(<LibraryAccordion />);
      const faqBtn = screen.getByRole("button", { name: /FAQ Library/i });
      fireEvent.click(faqBtn);
      expect(faqBtn).toHaveAttribute("aria-expanded", "true");
    });

    it("closes the previously open item when another is clicked (single-open)", () => {
      render(<LibraryAccordion />);
      const faqBtn = screen.getByRole("button", { name: /FAQ Library/i });
      const testimonialsBtn = screen.getByRole("button", {
        name: /Parent Testimonials/i,
      });

      fireEvent.click(faqBtn);
      expect(faqBtn).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(testimonialsBtn);
      expect(faqBtn).toHaveAttribute("aria-expanded", "false");
      expect(testimonialsBtn).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses an item when clicked again", () => {
      render(<LibraryAccordion />);
      const faqBtn = screen.getByRole("button", { name: /FAQ Library/i });
      fireEvent.click(faqBtn);
      expect(faqBtn).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(faqBtn);
      expect(faqBtn).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("fragment deep-linking", () => {
    it("auto-expands FAQ section when hash is #faq", () => {
      window.location.hash = "#faq";
      render(<LibraryAccordion />);
      const faqBtn = screen.getByRole("button", { name: /FAQ Library/i });
      expect(faqBtn).toHaveAttribute("aria-expanded", "true");
    });

    it("auto-expands testimonials section when hash is #testimonials", () => {
      window.location.hash = "#testimonials";
      render(<LibraryAccordion />);
      const btn = screen.getByRole("button", {
        name: /Parent Testimonials/i,
      });
      expect(btn).toHaveAttribute("aria-expanded", "true");
    });

    it("auto-expands talking points section when hash is #talking-points", () => {
      window.location.hash = "#talking-points";
      render(<LibraryAccordion />);
      const btn = screen.getByRole("button", {
        name: /Talking Points/i,
      });
      expect(btn).toHaveAttribute("aria-expanded", "true");
    });

    it("ignores invalid fragments and keeps all items collapsed", () => {
      window.location.hash = "#invalid";
      render(<LibraryAccordion />);
      const buttons = screen.getAllByRole("button", {
        name: /FAQ Library|Parent Testimonials|Talking Points/i,
      });
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("responds to hashchange events", () => {
      render(<LibraryAccordion />);
      const faqBtn = screen.getByRole("button", { name: /FAQ Library/i });
      expect(faqBtn).toHaveAttribute("aria-expanded", "false");

      window.location.hash = "#faq";
      fireEvent(window, new HashChangeEvent("hashchange"));
      expect(faqBtn).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("FAQ section", () => {
    it("displays FAQ description when expanded", () => {
      render(<LibraryAccordion />);
      fireEvent.click(
        screen.getByRole("button", { name: /FAQ Library/i })
      );
      expect(
        screen.getByText(/comprehensive FAQ covering admissions/i)
      ).toBeInTheDocument();
    });

    it("has a CTA linking to alpha.school/faq in a new tab", () => {
      render(<LibraryAccordion />);
      fireEvent.click(
        screen.getByRole("button", { name: /FAQ Library/i })
      );
      const cta = screen.getByText("Browse the FAQ");
      const link = cta.closest("a");
      expect(link).toHaveAttribute("href", "https://alpha.school/faq/");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("testimonials section", () => {
    it("renders video cards when expanded", () => {
      render(<LibraryAccordion />);
      fireEvent.click(
        screen.getByRole("button", { name: /Parent Testimonials/i })
      );
      expect(
        screen.getByText("From Good to Great — No Learning Gaps")
      ).toBeInTheDocument();
      expect(
        screen.getByText("30 Days to a Different Kid")
      ).toBeInTheDocument();
    });

    it("renders thumbnails using YouTube CDN URL", () => {
      render(<LibraryAccordion />);
      fireEvent.click(
        screen.getByRole("button", { name: /Parent Testimonials/i })
      );
      const imgs = screen.getAllByRole("img");
      const ytImg = imgs.find((img) =>
        img.getAttribute("src")?.includes("img.youtube.com")
      );
      expect(ytImg).toBeDefined();
      expect(ytImg?.getAttribute("src")).toContain("maxresdefault.jpg");
    });
  });

  describe("talking points section", () => {
    it("renders all 10 talking point headings", () => {
      render(<LibraryAccordion />);
      fireEvent.click(
        screen.getByRole("button", { name: /Talking Points/i })
      );
      const headings = [
        "2-Hour Learning Model",
        "AI-Powered 1:1 Learning",
        "Guides, Not Teachers",
        "Life Skills & Entrepreneurship",
        "Physical & Mental Wellness",
        "Community & Connection",
        "Daily Schedule",
        "Outcomes",
        "Student Experience",
        "Press & Validation",
      ];
      headings.forEach((h) => {
        expect(screen.getByText(h)).toBeInTheDocument();
      });
    });

    it("does not contain campus-specific content", () => {
      render(<LibraryAccordion />);
      fireEvent.click(
        screen.getByRole("button", { name: /Talking Points/i })
      );
      const content = document.body.textContent || "";
      expect(content).not.toContain("South Bay");
      expect(content).not.toContain("Toronto");
      expect(content).not.toContain("Alpha Austin");
      expect(content).not.toContain("Alpha San Francisco");
    });
  });
});

describe("VideoLightbox", () => {
  let overflowBefore: string;

  beforeEach(() => {
    overflowBefore = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = overflowBefore;
  });

  it("renders when isOpen is true", () => {
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("iframe is not in DOM when closed", () => {
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("uses youtube-nocookie.com domain", () => {
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.src).toContain("youtube-nocookie.com");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={true}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByLabelText("Close video"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={true}
        onClose={onClose}
      />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={true}
        onClose={onClose}
      />
    );
    const backdrop = document.querySelector("[aria-hidden='true']");
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it("has role=dialog and aria-modal=true", () => {
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("locks body scroll when open", () => {
    render(
      <VideoLightbox
        videoId="abc123"
        title="Test Video"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(document.body.style.overflow).toBe("hidden");
  });
});
