import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAuthenticated = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireAuthenticated: () => mockRequireAuthenticated(),
  requireAdmin: () => mockRequireAuthenticated(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () =>
    Promise.resolve({
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }),
      }),
    }),
}));

import {
  updateProspectStatus,
  addNote,
  setFollowUpDate,
  createProspect,
} from "@/lib/actions/prospects";

describe("prospect server actions — null geography guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: null,
    });
  });

  it("updateProspectStatus returns error", async () => {
    const result = await updateProspectStatus({
      prospect_id: "p1",
      new_status: "committed",
      updated_at: new Date().toISOString(),
    });
    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("addNote returns error", async () => {
    const result = await addNote({
      prospect_id: "p1",
      body: "test note",
    });
    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("setFollowUpDate returns error", async () => {
    const result = await setFollowUpDate({
      prospect_id: "p1",
      follow_up_date: "2026-05-01",
    });
    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("createProspect returns error", async () => {
    const result = await createProspect({
      parent_first: "Jane",
      parent_last: "Doe",
      parent_email: "jane@example.com",
      source: "referral",
      children: [{ first_name: "Kid", grade: "3rd", age: 8 }],
    });
    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });
});
