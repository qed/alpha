import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAuthenticated = vi.fn();
vi.mock("@/lib/auth", () => ({
  requireAuthenticated: () => mockRequireAuthenticated(),
}));

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockUpsert = vi.fn();
const mockLike = vi.fn();

function createChainedMock(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "upsert", "eq", "like", "single", "maybeSingle"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  Object.assign(chain, overrides);
  return chain;
}

let profileQueryResult: unknown = null;
let profileInsertResult: unknown = null;
let geographyInsertResult: unknown = null;
let profileUpdateResult: unknown = { error: null };
let slugQueryResult: unknown = [];
let auditInsertResult: unknown = { error: null };

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => ({
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: profileQueryResult }),
              single: () => Promise.resolve({ data: profileInsertResult }),
            }),
          }),
          update: (data: unknown) => {
            mockUpdate(data);
            return {
              eq: () => Promise.resolve(profileUpdateResult),
            };
          },
          upsert: (_data: unknown, _opts: unknown) => {
            mockUpsert(_data);
            return {
              select: () => ({
                single: () => Promise.resolve({ data: profileInsertResult }),
              }),
            };
          },
        };
      }
      if (table === "geographies") {
        return {
          select: () => ({
            like: (_col: string, pattern: string) => {
              mockLike(pattern);
              return Promise.resolve({ data: slugQueryResult });
            },
          }),
          insert: (data: unknown) => {
            mockInsert(data);
            return {
              select: () => ({
                single: () => Promise.resolve(geographyInsertResult),
              }),
            };
          },
        };
      }
      if (table === "audit_log") {
        return {
          insert: (data: unknown) => {
            mockSelect(data);
            return Promise.resolve(auditInsertResult);
          },
        };
      }
      return createChainedMock();
    },
  }),
}));

const mockUpdateUserMetadata = vi.fn().mockResolvedValue({});
const mockGetUser = vi.fn().mockResolvedValue({
  emailAddresses: [{ emailAddress: "test@example.com" }],
  firstName: "Test",
  lastName: "User",
});

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: () =>
    Promise.resolve({
      users: {
        updateUserMetadata: mockUpdateUserMetadata,
        getUser: mockGetUser,
      },
    }),
}));

import { selectGeography, createGeography } from "@/lib/actions/geography-selection";

describe("selectGeography", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profileQueryResult = { id: "profile-uuid-1", geography_id: null, clerk_user_id: "user_1" };
    profileInsertResult = null;
    profileUpdateResult = { error: null };
    geographyInsertResult = { data: { id: "geo-new" }, error: null };
    slugQueryResult = [];
    auditInsertResult = { error: null };
  });

  it("assigns geography, updates Clerk metadata, writes audit log", async () => {
    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: null,
    });

    const result = await selectGeography({ geographyId: "550e8400-e29b-41d4-a716-446655440000" });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ geography_id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(mockUpdateUserMetadata).toHaveBeenCalledWith("user_1", {
      privateMetadata: { geography_id: "550e8400-e29b-41d4-a716-446655440000" },
    });
    expect(mockSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "profile-uuid-1",
        action: "geography-select",
        geography_id: "550e8400-e29b-41d4-a716-446655440000",
      })
    );
  });

  it("rejects user who already has geography in both Supabase and Clerk", async () => {
    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: "existing-geo",
    });
    profileQueryResult = { id: "profile-uuid-1", geography_id: "existing-geo", clerk_user_id: "user_1" };

    const result = await selectGeography({ geographyId: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("already have a geography");
  });

  it("retries Clerk metadata when Supabase has geography but Clerk does not", async () => {
    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: null,
    });
    profileQueryResult = { id: "profile-uuid-1", geography_id: "existing-geo", clerk_user_id: "user_1" };

    const result = await selectGeography({ geographyId: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(true);
    expect(mockUpdateUserMetadata).toHaveBeenCalledWith("user_1", {
      privateMetadata: { geography_id: "existing-geo" },
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns retryable error when Clerk API fails", async () => {
    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: null,
    });
    mockUpdateUserMetadata.mockRejectedValueOnce(new Error("Clerk API error"));

    const result = await selectGeography({ geographyId: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(false);
    expect(result.retryable).toBe(true);
  });

  it("rejects invalid input", async () => {
    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: null,
    });

    const result = await selectGeography({ geographyId: "not-a-uuid" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid input");
  });

  it("returns specific error on concurrent claim", async () => {
    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: null,
    });
    profileUpdateResult = { error: { code: "23505", message: "unique violation" } };

    const result = await selectGeography({ geographyId: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("just claimed");
  });
});

describe("createGeography", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profileQueryResult = { id: "profile-uuid-1", geography_id: null, clerk_user_id: "user_1" };
    profileInsertResult = null;
    profileUpdateResult = { error: null };
    geographyInsertResult = { data: { id: "geo-new" }, error: null };
    slugQueryResult = [];
    auditInsertResult = { error: null };

    mockRequireAuthenticated.mockResolvedValue({
      userId: "user_1",
      role: "champion",
      geographyId: null,
    });
  });

  it("creates geography with correct slug, assigns to champion", async () => {
    const result = await createGeography({
      name: "Springfield",
      region: "Illinois",
      country: "US",
    });

    expect(result.success).toBe(true);
    expect(result.geographyId).toBe("geo-new");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "springfield-illinois",
        name: "Springfield",
        region: "Illinois",
        country: "US",
        status: "pre-launch",
      })
    );
    expect(mockUpdateUserMetadata).toHaveBeenCalled();
    expect(mockSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "geography-create",
        geography_id: "geo-new",
      })
    );
  });

  it("rejects user who already has a geography", async () => {
    profileQueryResult = { id: "profile-uuid-1", geography_id: "existing-geo", clerk_user_id: "user_1" };

    const result = await createGeography({
      name: "Toronto",
      region: "Ontario",
      country: "CA",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("already have a geography");
  });

  it("handles slug collision with numeric suffix", async () => {
    slugQueryResult = [{ slug: "springfield-illinois" }];

    const result = await createGeography({
      name: "Springfield",
      region: "Illinois",
      country: "US",
    });

    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "springfield-illinois-2" })
    );
  });

  it("handles reserved slug by appending suffix", async () => {
    const result = await createGeography({
      name: "Hub",
      region: "",
      country: "US",
    });

    // "hub" is a RESERVED_SLUG — but region is required and min 1 char
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid input");
  });

  it("rejects invalid input", async () => {
    const result = await createGeography({
      name: "",
      region: "Ontario",
      country: "US",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid input");
  });

  it("strips HTML from name and region", async () => {
    const result = await createGeography({
      name: "<b>Toronto</b>",
      region: "<script>alert(1)</script>Ontario",
      country: "CA",
    });

    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Toronto",
        region: "alert(1)Ontario",
      })
    );
  });
});
