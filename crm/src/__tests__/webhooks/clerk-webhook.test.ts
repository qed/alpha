import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({ upsert: mockUpsert }),
  }),
}));

vi.mock("svix", () => {
  class MockWebhook {
    verify(_payload: string, _headers: Record<string, string>) {
      return {
        type: "user.created",
        data: {
          id: "user_abc123",
          email_addresses: [{ email_address: "champion@alpha.com" }],
          first_name: "Jane",
          last_name: "Champion",
          private_metadata: {
            role: "champion",
            geography_id: "geo-uuid-123",
          },
          public_metadata: {},
        },
      };
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

describe("Clerk webhook handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
  });

  it("syncs user profile on user.created", async () => {
    const { POST } = await import("@/app/api/webhooks/clerk/route");
    const req = new Request("http://localhost/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        clerk_user_id: "user_abc123",
        email: "champion@alpha.com",
        full_name: "Jane Champion",
        role: "champion",
        geography_id: "geo-uuid-123",
        is_active: true,
      },
      { onConflict: "clerk_user_id" }
    );
  });

  it("rejects requests without svix headers", async () => {
    vi.mocked((await import("next/headers")).headers).mockResolvedValueOnce({
      get: () => null,
    } as any);

    const { POST } = await import("@/app/api/webhooks/clerk/route");
    const req = new Request("http://localhost/api/webhooks/clerk", {
      method: "POST",
      body: "{}",
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
