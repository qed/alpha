import { describe, it, expect } from "vitest";
import {
  updateStatusSchema,
  addNoteSchema,
  setFollowUpSchema,
  createProspectSchema,
} from "@/lib/validations/prospect-schema";

describe("updateStatusSchema", () => {
  it("accepts valid status transition data", () => {
    const result = updateStatusSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      new_status: "shadow-day",
      updated_at: "2026-04-29T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateStatusSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      new_status: "invalid-status",
      updated_at: "2026-04-29T12:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid prospect_id", () => {
    const result = updateStatusSchema.safeParse({
      prospect_id: "not-a-uuid",
      new_status: "enrolled",
      updated_at: "2026-04-29T12:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("addNoteSchema", () => {
  it("accepts valid note", () => {
    const result = addNoteSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "Had a great conversation with the family.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty body", () => {
    const result = addNoteSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("strips HTML from body", () => {
    const result = addNoteSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "<script>alert('xss')</script>Clean text",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("alert('xss')Clean text");
    }
  });
});

describe("setFollowUpSchema", () => {
  it("accepts future date", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const result = setFollowUpSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      follow_up_date: futureDate.toISOString().split("T")[0],
      updated_at: "2026-04-29T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts today", () => {
    const today = new Date().toISOString().split("T")[0];
    const result = setFollowUpSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      follow_up_date: today,
      updated_at: "2026-04-29T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects past date", () => {
    const result = setFollowUpSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      follow_up_date: "2020-01-01",
      updated_at: "2026-04-29T12:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null follow_up_date to clear it", () => {
    const result = setFollowUpSchema.safeParse({
      prospect_id: "550e8400-e29b-41d4-a716-446655440000",
      follow_up_date: null,
      updated_at: "2026-04-29T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });
});

describe("createProspectSchema", () => {
  it("validates all fields and accepts valid data", () => {
    const result = createProspectSchema.safeParse({
      parent_first: "Jane",
      parent_last: "Doe",
      parent_email: "jane@example.com",
      children: [{ first_name: "Alice" }],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one child", () => {
    const result = createProspectSchema.safeParse({
      parent_first: "Jane",
      parent_last: "Doe",
      parent_email: "jane@example.com",
      children: [],
    });
    expect(result.success).toBe(false);
  });

  it("lowercases email", () => {
    const result = createProspectSchema.safeParse({
      parent_first: "Jane",
      parent_last: "Doe",
      parent_email: "JANE@EXAMPLE.COM",
      children: [{ first_name: "Alice" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parent_email).toBe("jane@example.com");
    }
  });
});
