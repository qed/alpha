import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiStrip } from "@/components/dashboard/kpi-strip";

describe("KpiStrip", () => {
  it("displays correct deposits count (3 committed + 2 enrolled = 5)", () => {
    render(
      <KpiStrip
        deposits={5}
        depositTarget={25}
        depositDelta={2}
        activePipeline={8}
        interestedCount={5}
        shadowDayCount={3}
        totalContacts={20}
        streak={7}
      />
    );
    const text = document.body.textContent;
    expect(text).toContain("5");
    expect(text).toContain("/25");
  });

  it("shows all KPIs as 0 when there are no prospects", () => {
    const { container } = render(
      <KpiStrip
        deposits={0}
        depositTarget={25}
        depositDelta={0}
        activePipeline={0}
        interestedCount={0}
        shadowDayCount={0}
        totalContacts={0}
        streak={0}
      />
    );
    const items = container.querySelectorAll('[role="listitem"]');
    // Deposits card shows 0
    expect(items[0].textContent).toContain("0");
    // Active Pipeline shows 0
    expect(items[1].textContent).toContain("0");
    // Total Contacts shows 0
    expect(items[2].textContent).toContain("0");
    // Streak shows 0d
    expect(items[3].textContent).toContain("0");
  });

  it("shows +0 deposit delta when no status changes in 14 days", () => {
    render(
      <KpiStrip
        deposits={10}
        depositTarget={25}
        depositDelta={0}
        activePipeline={5}
        interestedCount={3}
        shadowDayCount={2}
        totalContacts={15}
        streak={3}
      />
    );
    expect(document.body.textContent).toContain("+0");
    expect(document.body.textContent).toContain("in the last 14 days");
  });

  it("shows deposit delta of +3 correctly", () => {
    render(
      <KpiStrip
        deposits={8}
        depositTarget={25}
        depositDelta={3}
        activePipeline={12}
        interestedCount={7}
        shadowDayCount={5}
        totalContacts={25}
        streak={14}
      />
    );
    expect(document.body.textContent).toContain("+3");
  });

  it("shows streak in days format", () => {
    const { container } = render(
      <KpiStrip
        deposits={5}
        depositTarget={25}
        depositDelta={1}
        activePipeline={10}
        interestedCount={6}
        shadowDayCount={4}
        totalContacts={18}
        streak={21}
      />
    );
    const items = container.querySelectorAll('[role="listitem"]');
    expect(items[3].textContent).toContain("21");
    expect(items[3].textContent).toContain("d");
  });

  it("shows interested and shadow day breakdown in Active Pipeline", () => {
    render(
      <KpiStrip
        deposits={5}
        depositTarget={25}
        depositDelta={1}
        activePipeline={9}
        interestedCount={6}
        shadowDayCount={3}
        totalContacts={18}
        streak={5}
      />
    );
    expect(document.body.textContent).toContain("6 interested");
    expect(document.body.textContent).toContain("3 shadow day");
  });
});
