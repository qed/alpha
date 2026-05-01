import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAdmin = vi.fn();
vi.mock("@/lib/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

const mockUpdate = vi.fn();
const mockInsert = vi.fn();

let newChampionResult: unknown = null;
let currentChampionResult: unknown = null;
let updateResult: unknown = { error: null };

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => ({
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: (_col: string, val: unknown) => {
              if (val === "new-champion-id") {
                return { single: () => Promise.resolve({ data: newChampionResult }) };
              }
              return {
                eq: (_c2: string, _v2: unknown) => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: currentChampionResult }),
                  }),
                }),
                single: () => Promise.resolve({ data: newChampionResult }),
              };
            },
          }),
          update: (data: unknown) => {
            mockUpdate(data);
            return {
              eq: () => Promise.resolve(updateResult),
            };
          },
        };
      }
      if (table === "audit_log") {
        return {
          insert: (data: unknown) => {
            mockInsert(data);
            return Promise.resolve({ error: null });
          },
        };
      }
      return {};
    },
  }),
}));

const mockUpdateUserMetadata = vi.fn().mockResolvedValue({});
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: () =>
    Promise.resolve({
      users: { updateUserMetadata: mockUpdateUserMetadata },
    }),
}));

import { reassignGeography } from "@/lib/actions/champions";

describe("reassignGeography — Clerk metadata sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ userId: "admin-user-id" });
    newChampionResult = {
      id: "new-champion-id",
      full_name: "New Champion",
      geography_id: null,
      is_active: true,
      clerk_user_id: "clerk_new",
    };
    currentChampionResult = {
      id: "old-champion-id",
      full_name: "Old Champion",
      clerk_user_id: "clerk_old",
    };
    updateResult = { error: null };
  });

  it("clears old champion Clerk metadata and sets new champion metadata", async () => {
    const result = await reassignGeography({
      geographyId: "geo-1",
      newChampionProfileId: "new-champion-id",
    });

    expect(result.success).toBe(true);
    expect(mockUpdateUserMetadata).toHaveBeenCalledWith("clerk_old", {
      privateMetadata: { geography_id: null },
    });
    expect(mockUpdateUserMetadata).toHaveBeenCalledWith("clerk_new", {
      privateMetadata: { geography_id: "geo-1" },
    });
  });

  it("writes audit log with old and new champion names", async () => {
    await reassignGeography({
      geographyId: "geo-1",
      newChampionProfileId: "new-champion-id",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "admin-user-id",
        action: "champion-reassign",
        geography_id: "geo-1",
        metadata: {
          old_champion: "Old Champion",
          new_champion: "New Champion",
        },
      })
    );
  });

  it("works when no current champion exists", async () => {
    currentChampionResult = null;

    const result = await reassignGeography({
      geographyId: "geo-1",
      newChampionProfileId: "new-champion-id",
    });

    expect(result.success).toBe(true);
    expect(mockUpdateUserMetadata).toHaveBeenCalledTimes(1);
    expect(mockUpdateUserMetadata).toHaveBeenCalledWith("clerk_new", {
      privateMetadata: { geography_id: "geo-1" },
    });
  });

  it("returns error when old champion Clerk update fails", async () => {
    mockUpdateUserMetadata.mockRejectedValueOnce(new Error("Clerk down"));

    const result = await reassignGeography({
      geographyId: "geo-1",
      newChampionProfileId: "new-champion-id",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("clear old champion");
  });

  it("returns error when new champion Clerk update fails", async () => {
    mockUpdateUserMetadata
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("Clerk down"));

    const result = await reassignGeography({
      geographyId: "geo-1",
      newChampionProfileId: "new-champion-id",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("session update failed for new champion");
  });

  it("rejects inactive target champion", async () => {
    newChampionResult = { ...(newChampionResult as Record<string, unknown>), is_active: false };

    const result = await reassignGeography({
      geographyId: "geo-1",
      newChampionProfileId: "new-champion-id",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found or inactive");
  });
});
