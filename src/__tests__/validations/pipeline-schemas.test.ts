import { describe, it, expect } from "vitest";
import {
  createPipelineProspectSchema,
  toggleSignalSchema,
  updateConcernsSchema,
  overrideHeatSchema,
  addPipelineNoteSchema,
} from "@/lib/validations/pipeline-schemas";

describe("createPipelineProspectSchema", () => {
  it("accepts minimal input (first + last only)", () => {
    const result = createPipelineProspectSchema.safeParse({
      parent_first: "John",
      parent_last: "Smith",
    });
    expect(result.success).toBe(true);
  });

  it("accepts full input", () => {
    const result = createPipelineProspectSchema.safeParse({
      parent_first: "John",
      parent_last: "Smith",
      parent_email: "john@example.com",
      parent_phone: "555-1234",
      spouse_name: "Jane Smith",
      neighborhood: "Port Credit",
      source: "Referral",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parent_email).toBe("john@example.com");
    }
  });

  it("rejects empty first name", () => {
    const result = createPipelineProspectSchema.safeParse({
      parent_first: "",
      parent_last: "Smith",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = createPipelineProspectSchema.safeParse({
      parent_first: "John",
      parent_last: "Smith",
      parent_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("strips HTML from text fields", () => {
    const result = createPipelineProspectSchema.safeParse({
      parent_first: "<b>John</b>",
      parent_last: "Smith<script>alert('xss')</script>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parent_first).toBe("John");
      expect(result.data.parent_last).toBe("Smithalert('xss')");
    }
  });

  it("lowercases email", () => {
    const result = createPipelineProspectSchema.safeParse({
      parent_first: "John",
      parent_last: "Smith",
      parent_email: "JOHN@Example.COM",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parent_email).toBe("john@example.com");
    }
  });
});

describe("toggleSignalSchema", () => {
  it("accepts valid signal toggle", () => {
    const result = toggleSignalSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      signal_id: "faq",
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown signal ID", () => {
    const result = toggleSignalSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      signal_id: "unknown-signal",
      active: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid signal IDs", () => {
    const signals = ["faq", "1-1", "intro", "deposit", "tour", "shadow"];
    for (const signal of signals) {
      const result = toggleSignalSchema.safeParse({
        prospect_id: "123e4567-e89b-12d3-a456-426614174000",
        signal_id: signal,
        active: false,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateConcernsSchema", () => {
  it("accepts valid concerns array", () => {
    const result = updateConcernsSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      concerns: ["tuition", "pace"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty concerns array", () => {
    const result = updateConcernsSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      concerns: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown concern values", () => {
    const result = updateConcernsSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      concerns: ["tuition", "unknown-concern"],
    });
    expect(result.success).toBe(false);
  });
});

describe("overrideHeatSchema", () => {
  it("accepts heat score 1-5", () => {
    for (let i = 1; i <= 5; i++) {
      const result = overrideHeatSchema.safeParse({
        prospect_id: "123e4567-e89b-12d3-a456-426614174000",
        heat_score: i,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects heat score 0", () => {
    const result = overrideHeatSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      heat_score: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects heat score 6", () => {
    const result = overrideHeatSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      heat_score: 6,
    });
    expect(result.success).toBe(false);
  });
});

describe("addPipelineNoteSchema", () => {
  it("accepts valid note", () => {
    const result = addPipelineNoteSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      body: "Called the family today",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty body", () => {
    const result = addPipelineNoteSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("strips HTML from body", () => {
    const result = addPipelineNoteSchema.safeParse({
      prospect_id: "123e4567-e89b-12d3-a456-426614174000",
      body: "<b>Important</b> note",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("Important note");
    }
  });
});
