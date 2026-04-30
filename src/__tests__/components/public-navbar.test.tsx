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

  it("renders The Academics link pointing to the report card PDF", () => {
    render(<PublicNavbar />);
    const link = screen.getByText("The Academics");
    expect(link).toHaveAttribute("href", "/artifacts/alpha-report-card.pdf");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders Join the Community link pointing to community.alpha.school", () => {
    render(<PublicNavbar />);
    const link = screen.getByText("Join the Community");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("community.alpha.school")
    );
    expect(link).toHaveAttribute("target", "_blank");
  });
});
