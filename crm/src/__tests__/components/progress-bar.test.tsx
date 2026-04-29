import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/shared/progress-bar";

describe("ProgressBar", () => {
  it("shows correct percentage for 10/25", () => {
    render(<ProgressBar count={10} />);
    expect(screen.getByText("10 / 25")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("caps at 100% when count exceeds threshold", () => {
    render(<ProgressBar count={30} />);
    expect(screen.getByText("30 / 25")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows zero prospects with empty bar", () => {
    render(<ProgressBar count={0} />);
    expect(screen.getByText("0 / 25")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("uses custom threshold", () => {
    render(<ProgressBar count={5} threshold={10} />);
    expect(screen.getByText("5 / 10")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders the progress fill bar", () => {
    const { container } = render(<ProgressBar count={12} />);
    const fill = container.querySelector("[style]") as HTMLElement;
    expect(fill).toBeTruthy();
    expect(fill.style.width).toBe("48%");
  });

  it("shows success color at 100%", () => {
    const { container } = render(<ProgressBar count={25} />);
    const fill = container.querySelector("[style]") as HTMLElement;
    expect(fill.style.backgroundColor).toBe("var(--color-success)");
  });

  it("shows blue color below 100%", () => {
    const { container } = render(<ProgressBar count={10} />);
    const fill = container.querySelector("[style]") as HTMLElement;
    expect(fill.style.backgroundColor).toBe("var(--color-alpha-blue)");
  });
});
