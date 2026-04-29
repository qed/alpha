import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ChildFields } from "@/components/intake/child-fields";

const defaultChild = { first_name: "", grade: "", age: "", gender: "" };

describe("ChildFields", () => {
  it("renders initial child row", () => {
    const { container } = render(
      <ChildFields entries={[defaultChild]} onChange={vi.fn()} />
    );
    const childLabels = container.querySelectorAll("span");
    const childOneLabel = Array.from(childLabels).find((el) =>
      el.textContent?.includes("Child")
    );
    expect(childOneLabel).toBeTruthy();
  });

  it("can add child rows up to 15", () => {
    const onChange = vi.fn();
    const entries = Array.from({ length: 14 }, () => ({ ...defaultChild }));
    const { container } = render(
      <ChildFields entries={entries} onChange={onChange} />
    );

    const addBtn = container.querySelector("button");
    expect(addBtn?.textContent).toContain("Add child");
    fireEvent.click(addBtn!);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toHaveLength(15);
  });

  it("hides add button at 15 children", () => {
    const entries = Array.from({ length: 15 }, () => ({ ...defaultChild }));
    const { container } = render(
      <ChildFields entries={entries} onChange={vi.fn()} />
    );
    const buttons = container.querySelectorAll("button");
    const addBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Add child")
    );
    expect(addBtn).toBeUndefined();
  });

  it("does not show remove button with only one child", () => {
    const { container } = render(
      <ChildFields entries={[defaultChild]} onChange={vi.fn()} />
    );
    const removeBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Remove")
    );
    expect(removeBtn).toBeUndefined();
  });

  it("shows remove buttons with multiple children", () => {
    const entries = [
      { ...defaultChild, first_name: "Alice" },
      { ...defaultChild, first_name: "Bob" },
    ];
    const { container } = render(
      <ChildFields entries={entries} onChange={vi.fn()} />
    );
    const removeBtns = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Remove")
    );
    expect(removeBtns.length).toBe(2);
  });

  it("each child row has name and age fields", () => {
    const { container } = render(
      <ChildFields entries={[defaultChild]} onChange={vi.fn()} />
    );
    const nameInput = container.querySelector(
      'input[placeholder="First name *"]'
    );
    const ageInput = container.querySelector('input[placeholder="Age"]');
    expect(nameInput).toBeTruthy();
    expect(ageInput).toBeTruthy();
  });
});
