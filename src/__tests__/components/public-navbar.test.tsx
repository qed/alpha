import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicNavbar } from "@/components/shared/public-navbar";

describe("PublicNavbar", () => {
  it("renders the Alpha Toronto logo", () => {
    render(<PublicNavbar />);
    const logo = screen.getByAltText("Alpha Toronto");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", expect.stringContaining("Alpha"));
  });

  it("renders the Parents Hub label", () => {
    render(<PublicNavbar />);
    expect(screen.getByText("Parents Hub")).toBeInTheDocument();
  });

  it("renders For Parents link pointing to /for-parents", () => {
    render(<PublicNavbar />);
    const link = screen.getByText("For Parents");
    expect(link).toHaveAttribute("href", "/for-parents");
  });

  it("renders Join the Community CTA by default", () => {
    render(<PublicNavbar />);
    const link = screen.getByText("Join the Community");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("community.alpha.school")
    );
  });

  it("renders Enter the Hub CTA when variant is hub", () => {
    render(<PublicNavbar variant="hub" />);
    const link = screen.getByText("Enter the Hub");
    expect(link).toHaveAttribute("href", "/hub/sign-in");
  });
});
