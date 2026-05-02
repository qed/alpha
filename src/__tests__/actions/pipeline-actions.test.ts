import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Module-level mocks (hoisted before imports)
// ---------------------------------------------------------------------------

const mockRequireAuthenticated = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireAuthenticated: () => mockRequireAuthenticated(),
}));

// Mutable result variables — reset in beforeEach
let prospectSelectResult: { data: unknown; error: unknown } = {
  data: null,
  error: null,
};
let prospectInsertResult: { data: unknown; error: unknown } = {
  data: null,
  error: null,
};
let prospectUpdateResult: { error: unknown } = { error: null };
let noteInsertResult: { error: unknown } = { error: null };
let libraryItemSelectResult: { data: unknown; error: unknown } = {
  data: null,
  error: null,
};
let librarySendInsertResult: { error: unknown } = { error: null };
let libraryItemUpdateResult: { error: unknown } = { error: null };

// Spies for capturing insert/update payloads
const mockProspectInsert = vi.fn();
const mockProspectUpdate = vi.fn();
const mockNoteInsert = vi.fn();
const mockAuditInsert = vi.fn();
const mockLibrarySendInsert = vi.fn();
const mockLibraryItemUpdate = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () =>
    Promise.resolve({
      from: (table: string) => {
        if (table === "prospects") {
          return {
            insert: (data: unknown) => {
              mockProspectInsert(data);
              return {
                select: () => ({
                  single: () =>
                    Promise.resolve(prospectInsertResult),
                }),
              };
            },
            select: () => ({
              eq: (_col: string, _val: unknown) => ({
                single: () => Promise.resolve(prospectSelectResult),
              }),
            }),
            update: (data: unknown) => {
              mockProspectUpdate(data);
              return {
                eq: () => Promise.resolve(prospectUpdateResult),
              };
            },
          };
        }
        if (table === "notes") {
          return {
            insert: (data: unknown) => {
              mockNoteInsert(data);
              return Promise.resolve(noteInsertResult);
            },
          };
        }
        if (table === "audit_log") {
          return {
            insert: (data: unknown) => {
              mockAuditInsert(data);
              return Promise.resolve({ error: null });
            },
          };
        }
        if (table === "library_items") {
          return {
            select: () => ({
              eq: (_col: string, _val: unknown) => ({
                single: () => Promise.resolve(libraryItemSelectResult),
              }),
            }),
            update: (data: unknown) => {
              mockLibraryItemUpdate(data);
              return {
                eq: () => Promise.resolve(libraryItemUpdateResult),
              };
            },
          };
        }
        if (table === "library_sends") {
          return {
            insert: (data: unknown) => {
              mockLibrarySendInsert(data);
              return Promise.resolve(librarySendInsertResult);
            },
          };
        }
        return {};
      },
    }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  createPipelineProspect,
  toggleSignal,
  updateConcerns,
  overrideHeat,
  addPipelineNote,
  recordLibrarySend,
} from "@/lib/actions/pipeline";

// ---------------------------------------------------------------------------
// Test data constants
// ---------------------------------------------------------------------------

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const SESSION_GEO = "geo_1";

function defaultSession(overrides: Record<string, unknown> = {}) {
  return {
    userId: "user_1",
    role: "champion",
    geographyId: SESSION_GEO,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. createPipelineProspect
// ---------------------------------------------------------------------------

describe("createPipelineProspect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue(defaultSession());
    prospectInsertResult = { data: { id: VALID_UUID }, error: null };
    prospectSelectResult = { data: null, error: null };
    prospectUpdateResult = { error: null };
    noteInsertResult = { error: null };
  });

  it("creates prospect with correct defaults and returns prospectId", async () => {
    const result = await createPipelineProspect({
      parent_first: "Jane",
      parent_last: "Doe",
    });

    expect(result).toEqual({
      success: true,
      prospectId: VALID_UUID,
    });

    // Verify insert payload includes defaults
    expect(mockProspectInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        geography_id: SESSION_GEO,
        parent_first: "Jane",
        parent_last: "Doe",
        status: "interested",
        heat_score: 3,
        consent_given: true,
      })
    );

    // Verify insert payload has consent_at
    const insertPayload = mockProspectInsert.mock.calls[0][0];
    expect(insertPayload.consent_at).toBeDefined();
  });

  it("writes audit log with prospect-create action", async () => {
    await createPipelineProspect({
      parent_first: "Jane",
      parent_last: "Doe",
    });

    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "user_1",
        action: "prospect-create",
        geography_id: SESSION_GEO,
        prospect_id: VALID_UUID,
        metadata: {
          parent_name: "Jane Doe",
          source: "pipeline",
        },
      })
    );
  });

  it("returns error when geography is null", async () => {
    mockRequireAuthenticated.mockResolvedValue(
      defaultSession({ geographyId: null })
    );

    const result = await createPipelineProspect({
      parent_first: "Jane",
      parent_last: "Doe",
    });

    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("returns error on invalid input (empty parent_first)", async () => {
    const result = await createPipelineProspect({
      parent_first: "",
      parent_last: "Doe",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (missing parent_last)", async () => {
    const result = await createPipelineProspect({
      parent_first: "Jane",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error when Supabase insert fails", async () => {
    prospectInsertResult = {
      data: null,
      error: { message: "DB error" },
    };

    const result = await createPipelineProspect({
      parent_first: "Jane",
      parent_last: "Doe",
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to create prospect.",
    });
  });

  it("does not write audit log when insert fails", async () => {
    prospectInsertResult = {
      data: null,
      error: { message: "DB error" },
    };

    await createPipelineProspect({
      parent_first: "Jane",
      parent_last: "Doe",
    });

    expect(mockAuditInsert).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 2. toggleSignal
// ---------------------------------------------------------------------------

describe("toggleSignal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue(defaultSession());
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: SESSION_GEO,
        engagement_signals: [],
      },
      error: null,
    };
    prospectUpdateResult = { error: null };
  });

  it("adds a signal to an empty array", async () => {
    const result = await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: true,
    });

    expect(result).toEqual({ success: true });
    expect(mockProspectUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        engagement_signals: ["faq"],
      })
    );
    // last_touch_at should be set
    const payload = mockProspectUpdate.mock.calls[0][0];
    expect(payload.last_touch_at).toBeDefined();
  });

  it("removes a signal from an existing array", async () => {
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: SESSION_GEO,
        engagement_signals: ["faq", "1-1"],
      },
      error: null,
    };

    const result = await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: false,
    });

    expect(result).toEqual({ success: true });
    expect(mockProspectUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        engagement_signals: ["1-1"],
      })
    );
  });

  it("does not duplicate signal when already present", async () => {
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: SESSION_GEO,
        engagement_signals: ["faq"],
      },
      error: null,
    };

    await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: true,
    });

    expect(mockProspectUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        engagement_signals: ["faq"],
      })
    );
  });

  it("writes audit log with signal-toggle action", async () => {
    await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: true,
    });

    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "user_1",
        action: "signal-toggle",
        geography_id: SESSION_GEO,
        prospect_id: VALID_UUID,
        metadata: { signal_id: "faq", active: true },
      })
    );
  });

  it("returns error when geography is null", async () => {
    mockRequireAuthenticated.mockResolvedValue(
      defaultSession({ geographyId: null })
    );

    const result = await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: true,
    });

    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("returns error on invalid input (non-uuid prospect_id)", async () => {
    const result = await toggleSignal({
      prospect_id: "not-a-uuid",
      signal_id: "faq",
      active: true,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (invalid signal_id)", async () => {
    const result = await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "bogus",
      active: true,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error when prospect is not found", async () => {
    prospectSelectResult = {
      data: null,
      error: { message: "not found" },
    };

    const result = await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: true,
    });

    expect(result).toEqual({
      success: false,
      error: "Prospect not found.",
    });
  });

  it("returns error when prospect belongs to different geography", async () => {
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: "other_geo",
        engagement_signals: [],
      },
      error: null,
    };

    const result = await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: true,
    });

    expect(result).toEqual({
      success: false,
      error: "Access denied.",
    });
  });

  it("returns error when update fails", async () => {
    prospectUpdateResult = { error: { message: "update failed" } };

    const result = await toggleSignal({
      prospect_id: VALID_UUID,
      signal_id: "faq",
      active: true,
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to update signals.",
    });
  });
});

// ---------------------------------------------------------------------------
// 3. updateConcerns
// ---------------------------------------------------------------------------

describe("updateConcerns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue(defaultSession());
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: SESSION_GEO,
      },
      error: null,
    };
    prospectUpdateResult = { error: null };
  });

  it("sets concerns array on prospect and returns success", async () => {
    const result = await updateConcerns({
      prospect_id: VALID_UUID,
      concerns: ["tuition", "pace"],
    });

    expect(result).toEqual({ success: true });
    expect(mockProspectUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        concerns: ["tuition", "pace"],
      })
    );
    const payload = mockProspectUpdate.mock.calls[0][0];
    expect(payload.last_touch_at).toBeDefined();
  });

  it("writes audit log with concern-update action and concerns metadata", async () => {
    await updateConcerns({
      prospect_id: VALID_UUID,
      concerns: ["tuition", "socialization"],
    });

    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "user_1",
        action: "concern-update",
        geography_id: SESSION_GEO,
        prospect_id: VALID_UUID,
        metadata: { concerns: ["tuition", "socialization"] },
      })
    );
  });

  it("returns error when geography is null", async () => {
    mockRequireAuthenticated.mockResolvedValue(
      defaultSession({ geographyId: null })
    );

    const result = await updateConcerns({
      prospect_id: VALID_UUID,
      concerns: ["tuition"],
    });

    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("returns error on invalid input (non-uuid prospect_id)", async () => {
    const result = await updateConcerns({
      prospect_id: "not-a-uuid",
      concerns: ["tuition"],
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (invalid concern value)", async () => {
    const result = await updateConcerns({
      prospect_id: VALID_UUID,
      concerns: ["bogus-concern"] as unknown as string[],
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error when prospect is not found", async () => {
    prospectSelectResult = {
      data: null,
      error: { message: "not found" },
    };

    const result = await updateConcerns({
      prospect_id: VALID_UUID,
      concerns: ["tuition"],
    });

    expect(result).toEqual({
      success: false,
      error: "Prospect not found.",
    });
  });

  it("returns error when prospect belongs to different geography", async () => {
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: "other_geo",
      },
      error: null,
    };

    const result = await updateConcerns({
      prospect_id: VALID_UUID,
      concerns: ["tuition"],
    });

    expect(result).toEqual({
      success: false,
      error: "Access denied.",
    });
  });

  it("returns error when update fails", async () => {
    prospectUpdateResult = { error: { message: "update failed" } };

    const result = await updateConcerns({
      prospect_id: VALID_UUID,
      concerns: ["tuition"],
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to update concerns.",
    });
  });
});

// ---------------------------------------------------------------------------
// 4. overrideHeat
// ---------------------------------------------------------------------------

describe("overrideHeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue(defaultSession());
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: SESSION_GEO,
        heat_score: 3,
      },
      error: null,
    };
    prospectUpdateResult = { error: null };
  });

  it("updates heat_score and returns success", async () => {
    const result = await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 5,
    });

    expect(result).toEqual({ success: true });
    expect(mockProspectUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        heat_score: 5,
      })
    );
    const payload = mockProspectUpdate.mock.calls[0][0];
    expect(payload.last_touch_at).toBeDefined();
  });

  it("writes audit log with old_heat and new_heat metadata", async () => {
    await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 5,
    });

    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "user_1",
        action: "heat-override",
        geography_id: SESSION_GEO,
        prospect_id: VALID_UUID,
        metadata: { old_heat: 3, new_heat: 5 },
      })
    );
  });

  it("returns error when geography is null", async () => {
    mockRequireAuthenticated.mockResolvedValue(
      defaultSession({ geographyId: null })
    );

    const result = await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 5,
    });

    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("returns error on invalid input (non-uuid prospect_id)", async () => {
    const result = await overrideHeat({
      prospect_id: "not-a-uuid",
      heat_score: 5,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (heat_score out of range)", async () => {
    const result = await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 0,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (heat_score > 5)", async () => {
    const result = await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 6,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error when prospect is not found", async () => {
    prospectSelectResult = {
      data: null,
      error: { message: "not found" },
    };

    const result = await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 5,
    });

    expect(result).toEqual({
      success: false,
      error: "Prospect not found.",
    });
  });

  it("returns error when prospect belongs to different geography", async () => {
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: "other_geo",
        heat_score: 3,
      },
      error: null,
    };

    const result = await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 5,
    });

    expect(result).toEqual({
      success: false,
      error: "Access denied.",
    });
  });

  it("returns error when update fails", async () => {
    prospectUpdateResult = { error: { message: "update failed" } };

    const result = await overrideHeat({
      prospect_id: VALID_UUID,
      heat_score: 5,
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to update heat score.",
    });
  });
});

// ---------------------------------------------------------------------------
// 5. addPipelineNote
// ---------------------------------------------------------------------------

describe("addPipelineNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue(defaultSession());
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: SESSION_GEO,
      },
      error: null,
    };
    prospectUpdateResult = { error: null };
    noteInsertResult = { error: null };
  });

  it("inserts note with correct author_id and body", async () => {
    const result = await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "Spoke with parent about tuition options.",
    });

    expect(result).toEqual({ success: true });
    expect(mockNoteInsert).toHaveBeenCalledWith({
      prospect_id: VALID_UUID,
      geography_id: SESSION_GEO,
      author_id: "user_1",
      body: "Spoke with parent about tuition options.",
    });
  });

  it("updates last_touch_at on the prospect", async () => {
    await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "Follow-up call.",
    });

    expect(mockProspectUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        last_touch_at: expect.any(String),
      })
    );
  });

  it("writes audit log with note-add action and body_preview", async () => {
    const body = "Spoke with parent about tuition options.";
    await addPipelineNote({
      prospect_id: VALID_UUID,
      body,
    });

    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "user_1",
        action: "note-add",
        geography_id: SESSION_GEO,
        prospect_id: VALID_UUID,
        metadata: { body_preview: body.slice(0, 100) },
      })
    );
  });

  it("truncates body_preview to 100 chars in audit log", async () => {
    const longBody = "A".repeat(200);
    await addPipelineNote({
      prospect_id: VALID_UUID,
      body: longBody,
    });

    const auditPayload = mockAuditInsert.mock.calls[0][0];
    expect(auditPayload.metadata.body_preview).toHaveLength(100);
  });

  it("returns error when geography is null", async () => {
    mockRequireAuthenticated.mockResolvedValue(
      defaultSession({ geographyId: null })
    );

    const result = await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "Test note",
    });

    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("returns error on invalid input (empty body)", async () => {
    const result = await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (non-uuid prospect_id)", async () => {
    const result = await addPipelineNote({
      prospect_id: "not-a-uuid",
      body: "Test note",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error when prospect is not found", async () => {
    prospectSelectResult = {
      data: null,
      error: { message: "not found" },
    };

    const result = await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "Test note",
    });

    expect(result).toEqual({
      success: false,
      error: "Prospect not found.",
    });
  });

  it("returns error when prospect belongs to different geography", async () => {
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: "other_geo",
      },
      error: null,
    };

    const result = await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "Test note",
    });

    expect(result).toEqual({
      success: false,
      error: "Access denied.",
    });
  });

  it("returns error when note insert fails", async () => {
    noteInsertResult = { error: { message: "insert failed" } };

    const result = await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "Test note",
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to add note.",
    });
  });

  it("does not update last_touch_at or write audit log when note insert fails", async () => {
    noteInsertResult = { error: { message: "insert failed" } };

    await addPipelineNote({
      prospect_id: VALID_UUID,
      body: "Test note",
    });

    expect(mockProspectUpdate).not.toHaveBeenCalled();
    expect(mockAuditInsert).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 6. recordLibrarySend
// ---------------------------------------------------------------------------

const LIBRARY_ITEM_UUID = "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22";

describe("recordLibrarySend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthenticated.mockResolvedValue(defaultSession());
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: SESSION_GEO,
      },
      error: null,
    };
    prospectUpdateResult = { error: null };
    libraryItemSelectResult = {
      data: {
        id: LIBRARY_ITEM_UUID,
        send_count: 0,
        geography_id: null,
      },
      error: null,
    };
    librarySendInsertResult = { error: null };
    libraryItemUpdateResult = { error: null };
  });

  it("valid input inserts into library_sends, increments send_count, writes audit log, returns success", async () => {
    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({ success: true });

    // Verify library_sends insert
    expect(mockLibrarySendInsert).toHaveBeenCalledWith({
      library_item_id: LIBRARY_ITEM_UUID,
      prospect_id: VALID_UUID,
      champion_id: "user_1",
      geography_id: SESSION_GEO,
      channel: "in-app",
    });

    // Verify send_count increment (0 + 1 = 1)
    expect(mockLibraryItemUpdate).toHaveBeenCalledWith({ send_count: 1 });

    // Verify audit log
    expect(mockAuditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "user_1",
        action: "library-send",
        geography_id: SESSION_GEO,
        prospect_id: VALID_UUID,
        metadata: {
          library_item_id: LIBRARY_ITEM_UUID,
          prospect_id: VALID_UUID,
        },
      })
    );
  });

  it("returns error when geography is null", async () => {
    mockRequireAuthenticated.mockResolvedValue(
      defaultSession({ geographyId: null })
    );

    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "No geography assigned.",
    });
  });

  it("returns error on invalid input (missing prospect_id)", async () => {
    const result = await recordLibrarySend({
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (non-uuid prospect_id)", async () => {
    const result = await recordLibrarySend({
      prospect_id: "not-a-uuid",
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error on invalid input (missing library_item_id)", async () => {
    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid input.",
    });
  });

  it("returns error when prospect belongs to different geography", async () => {
    prospectSelectResult = {
      data: {
        id: VALID_UUID,
        geography_id: "other_geo",
      },
      error: null,
    };

    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Access denied.",
    });
  });

  it("returns error when prospect is not found", async () => {
    prospectSelectResult = {
      data: null,
      error: { message: "not found" },
    };

    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Prospect not found.",
    });
  });

  it("returns error when library item is not found", async () => {
    libraryItemSelectResult = {
      data: null,
      error: { message: "not found" },
    };

    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Library item not found.",
    });
  });

  it("returns error when library item belongs to different geography", async () => {
    libraryItemSelectResult = {
      data: {
        id: LIBRARY_ITEM_UUID,
        send_count: 0,
        geography_id: "other_geo",
      },
      error: null,
    };

    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Library item not found.",
    });
  });

  it("allows library item with matching geography_id", async () => {
    libraryItemSelectResult = {
      data: {
        id: LIBRARY_ITEM_UUID,
        send_count: 5,
        geography_id: SESSION_GEO,
      },
      error: null,
    };

    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({ success: true });
    expect(mockLibraryItemUpdate).toHaveBeenCalledWith({ send_count: 6 });
  });

  it("returns error when library_sends insert fails", async () => {
    librarySendInsertResult = { error: { message: "insert failed" } };

    const result = await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to record library send.",
    });
  });

  it("does not increment send_count or write audit log when library_sends insert fails", async () => {
    librarySendInsertResult = { error: { message: "insert failed" } };

    await recordLibrarySend({
      prospect_id: VALID_UUID,
      library_item_id: LIBRARY_ITEM_UUID,
    });

    expect(mockLibraryItemUpdate).not.toHaveBeenCalled();
    expect(mockAuditInsert).not.toHaveBeenCalled();
  });
});
