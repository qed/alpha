import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: mockSignOut }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/hub/dashboard",
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
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

import { HubSidebar } from "@/components/hub/hub-sidebar";

describe("HubSidebar", () => {
  const defaultProps = {
    isAuthenticated: true,
    isAdmin: false,
    geographyName: "Austin",
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all workspace nav items", () => {
    render(<HubSidebar {...defaultProps} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.getByText("My Page")).toBeInTheDocument();
  });

  it("shows admin section only when isAdmin is true", () => {
    const { rerender } = render(<HubSidebar {...defaultProps} isAdmin={false} />);
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(screen.queryByText("Leaderboard")).not.toBeInTheDocument();

    rerender(<HubSidebar {...defaultProps} isAdmin={true} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
  });

  it("shows geography name when provided", () => {
    render(<HubSidebar {...defaultProps} geographyName="Austin" />);
    expect(screen.getByText("Austin")).toBeInTheDocument();
  });

  it("shows placeholder when geography is null and authenticated", () => {
    render(<HubSidebar {...defaultProps} geographyName={null} />);
    expect(screen.getByText("Not yet selected")).toBeInTheDocument();
  });

  it("shows sign-in message when geography is null and not authenticated", () => {
    render(
      <HubSidebar {...defaultProps} isAuthenticated={false} geographyName={null} />
    );
    expect(screen.getByText("Set after sign-in")).toBeInTheDocument();
  });

  it("shows sign out button only when authenticated", () => {
    const { rerender } = render(<HubSidebar {...defaultProps} />);
    expect(screen.getByText("Sign Out")).toBeInTheDocument();

    rerender(<HubSidebar {...defaultProps} isAuthenticated={false} />);
    expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
  });

  it("redirects to sign-in for auth-required items when not authenticated", () => {
    render(<HubSidebar {...defaultProps} isAuthenticated={false} />);
    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockPush).toHaveBeenCalledWith(
      "/hub/sign-in?redirect_url=/hub/dashboard"
    );
  });

  it("navigates directly for authenticated users", () => {
    render(<HubSidebar {...defaultProps} />);
    fireEvent.click(screen.getByText("Pipeline"));
    expect(mockPush).toHaveBeenCalledWith("/hub/pipeline");
  });

  it("calls onClose after navigation", () => {
    render(<HubSidebar {...defaultProps} />);
    fireEvent.click(screen.getByText("Pipeline"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls signOut when Sign Out is clicked", () => {
    render(<HubSidebar {...defaultProps} />);
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/hub" });
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<HubSidebar {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders mobile backdrop when open", () => {
    const { container } = render(<HubSidebar {...defaultProps} isOpen={true} />);
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
  });

  it("does not render backdrop when closed", () => {
    const { container } = render(<HubSidebar {...defaultProps} isOpen={false} />);
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeInTheDocument();
  });
});
