import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({ upsert: mockUpsert }),
  }),
}));

let mockEventPayload: unknown = {};

vi.mock("svix", () => {
  class MockWebhook {
    verify() {
      return mockEventPayload;
    }
  }
  return { Webhook: MockWebhook };
});

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => {
      const map: Record<string, string> = {
        "svix-id": "msg_123",
        "svix-timestamp": "1234567890",
        "svix-signature": "v1,signature",
      };
      return map[name] || null;
    },
  }),
}));

function makeEvent(
  type: string,
  privateMetadata: Record<string, unknown> = {}
) {
  return {
    type,
    data: {
      id: "user_abc123",
      email_addresses: [{ email_address: "champion@alpha.com" }],
      first_name: "Jane",
      last_name: "Champion",
      private_metadata: privateMetadata,
      public_metadata: {},
    },
  };
}

async function callWebhook() {
  const { POST } = await import("@/app/api/webhooks/clerk/route");
  const req = new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return POST(req);
}

describe("Clerk webhook handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
  });

  it("syncs user profile with geography on user.created", async () => {
    mockEventPayload = makeEvent("user.created", {
      role: "champion",
      geography_id: "geo-uuid-123",
    });

    const response = await callWebhook();
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        clerk_user_id: "user_abc123",
        email: "champion@alpha.com",
        full_name: "Jane Champion",
        role: "champion",
        geography_id: "geo-uuid-123",
        is_active: true,
      }),
      { onConflict: "clerk_user_id" }
    );
  });

  it("updates geography when user.updated includes geography_id", async () => {
    mockEventPayload = makeEvent("user.updated", {
      role: "champion",
      geography_id: "geo-uuid-456",
    });

    const response = await callWebhook();
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ geography_id: "geo-uuid-456" }),
      { onConflict: "clerk_user_id" }
    );
  });

  it("preserves existing geography when user.updated omits geography_id", async () => {
    mockEventPayload = makeEvent("user.updated", {
      role: "champion",
    });

    const response = await callWebhook();
    expect(response.status).toBe(200);

    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg).not.toHaveProperty("geography_id");
    expect(upsertArg.clerk_user_id).toBe("user_abc123");
    expect(upsertArg.role).toBe("champion");
  });

  it("clears geography when user.updated has geography_id: null", async () => {
    mockEventPayload = makeEvent("user.updated", {
      role: "champion",
      geography_id: null,
    });

    const response = await callWebhook();
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ geography_id: null }),
      { onConflict: "clerk_user_id" }
    );
  });

  it("rejects requests without svix headers", async () => {
    vi.mocked((await import("next/headers")).headers).mockResolvedValueOnce({
      get: () => null,
    } as never);

    const response = await callWebhook();
    expect(response.status).toBe(400);
  });

  it("ignores non-user events", async () => {
    mockEventPayload = makeEvent("session.created", {});

    const response = await callWebhook();
    expect(response.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
