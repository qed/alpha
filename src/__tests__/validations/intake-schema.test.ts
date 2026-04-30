import { describe, it, expect } from "vitest";
import { intakeFormSchema } from "@/lib/validations/intake-schema";

const validData = {
  geography_slug: "boston",
  parent_first: "Jane",
  parent_last: "Doe",
  parent_email: "Jane@Example.com",
  parent_phone: "555-1234",
  spouse_name: "John",
  source: "Friend or family",
  children: [{ first_name: "Alice", grade: "3", age: 8, gender: "female" }],
  consent: true as const,
  turnstile_token: "test-token",
};

describe("intake form validation", () => {
  it("accepts valid submission", () => {
    const result = intakeFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("lowercases email", () => {
    const result = intakeFormSchema.parse(validData);
    expect(result.parent_email).toBe("jane@example.com");
  });

  it("rejects missing parent first name", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      parent_first: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      parent_email: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      parent_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects consent = false", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      consent: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 15 children", () => {
    const tooManyChildren = Array.from({ length: 16 }, (_, i) => ({
      first_name: `Child ${i + 1}`,
    }));
    const result = intakeFormSchema.safeParse({
      ...validData,
      children: tooManyChildren,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero children", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      children: [],
    });
    expect(result.success).toBe(false);
  });

  it("strips HTML from free-text fields", () => {
    const result = intakeFormSchema.parse({
      ...validData,
      parent_first: '<script>alert("xss")</script>Jane',
      spouse_name: "<b>John</b>",
    });
    expect(result.parent_first).toBe('alert("xss")Jane');
    expect(result.spouse_name).toBe("John");
  });

  it("rejects name exceeding max length", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      parent_first: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("accepts child with age between 2 and 19", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      children: [{ first_name: "Kid", age: 5 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects child with age below 2", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      children: [{ first_name: "Baby", age: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects child with age above 19", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      children: [{ first_name: "Adult", age: 20 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing turnstile token", () => {
    const result = intakeFormSchema.safeParse({
      ...validData,
      turnstile_token: "",
    });
    expect(result.success).toBe(false);
  });
});
