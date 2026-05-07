import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DepositThermometer } from "@/components/dashboard/deposit-thermometer";

describe("DepositThermometer", () => {
  it("shows correct progress percentage against enrollment_threshold", () => {
    const { container } = render(
      <DepositThermometer
        deposits={10}
        threshold={25}
        geographyName="Mississauga · Port Credit"
      />
    );
    const progressBar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(progressBar).toBeTruthy();
    expect(progressBar.style.width).toBe("40%");
    expect(progressBar.getAttribute("aria-valuenow")).toBe("10");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("25");
  });

  it("shows 0% with zero deposits", () => {
    const { container } = render(
      <DepositThermometer
        deposits={0}
        threshold={25}
        geographyName="Mississauga"
      />
    );
    const progressBar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(progressBar.style.width).toBe("0%");
    expect(container.textContent).toContain("25 to go");
  });

  it("handles non-default threshold (e.g. 50)", () => {
    const { container } = render(
      <DepositThermometer
        deposits={15}
        threshold={50}
        geographyName="Toronto · Downtown"
      />
    );
    const progressBar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(progressBar.style.width).toBe("30%");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("50");
    expect(container.textContent).toContain("35 to go");
  });

  it("caps at 100% when deposits exceed threshold", () => {
    const { container } = render(
      <DepositThermometer
        deposits={30}
        threshold={25}
        geographyName="Mississauga"
      />
    );
    const progressBar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(progressBar.style.width).toBe("100%");
    expect(container.textContent).toContain("0 to go");
  });

  it("shows geography name in eyebrow", () => {
    const { container } = render(
      <DepositThermometer
        deposits={5}
        threshold={25}
        geographyName="Mississauga · Port Credit Campus"
      />
    );
    expect(container.textContent).toContain("Mississauga · Port Credit Campus");
  });

  it("shows 'opening day' in the headline", () => {
    const { container } = render(
      <DepositThermometer
        deposits={5}
        threshold={25}
        geographyName="Toronto"
      />
    );
    expect(container.textContent).toContain("Toward");
    expect(container.textContent).toContain("opening day.");
  });

  it("displays deposit count and remaining", () => {
    const { container } = render(
      <DepositThermometer
        deposits={12}
        threshold={25}
        geographyName="Test"
      />
    );
    expect(container.textContent).toContain("12");
    expect(container.textContent).toContain("/25");
    expect(container.textContent).toContain("13 to go");
  });
});
