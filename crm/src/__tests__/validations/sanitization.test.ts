import { describe, it, expect } from "vitest";
import { intakeFormSchema } from "@/lib/validations/intake-schema";
import { addNoteSchema, createProspectSchema } from "@/lib/validations/prospect-schema";

const validBase = {
  geography_slug: "austin",
  parent_first: "Jane",
  parent_last: "Doe",
  parent_email: "jane@example.com",
  children: [{ first_name: "Alice" }],
  consent: true,
  turnstile_token: "valid-token",
};

describe("HTML stripping", () => {
  it("strips HTML tags from parent name", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      parent_first: "<b>Jane</b>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parent_first).toBe("Jane");
    }
  });

  it("strips script content from names", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      parent_first: "<script>alert('xss')</script>Jane",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parent_first).toBe("alert('xss')Jane");
      expect(result.data.parent_first).not.toContain("<script>");
    }
  });

  it("strips HTML from spouse name", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      spouse_name: "<em>John</em>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.spouse_name).toBe("John");
    }
  });

  it("strips HTML from child name", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      children: [{ first_name: "<b>Alice</b>" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.children[0].first_name).toBe("Alice");
    }
  });

  it("strips HTML from note body", () => {
    const result = addNoteSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "<p>Great meeting!</p>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("Great meeting!");
    }
  });
});

describe("Maximum field lengths", () => {
  it("rejects parent name exceeding 100 chars", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      parent_first: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects note body exceeding 2000 chars", () => {
    const result = addNoteSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("Age validation", () => {
  it("accepts integer age between 2 and 19", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      children: [{ first_name: "Alice", age: 5 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects age below 2", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      children: [{ first_name: "Alice", age: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects age above 19", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      children: [{ first_name: "Alice", age: 20 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("Gender validation", () => {
  it("accepts valid gender values", () => {
    for (const gender of ["male", "female", "non-binary", "prefer-not-to-say", ""]) {
      const result = intakeFormSchema.safeParse({
        ...validBase,
        children: [{ first_name: "Alice", gender }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid gender value", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      children: [{ first_name: "Alice", gender: "invalid" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("Email validation", () => {
  it("accepts valid email format", () => {
    const result = intakeFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      parent_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("lowercases email", () => {
    const result = intakeFormSchema.safeParse({
      ...validBase,
      parent_email: "JANE@EXAMPLE.COM",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parent_email).toBe("jane@example.com");
    }
  });
});
