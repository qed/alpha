import { Webhook } from "svix";
import { headers } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    private_metadata: {
      role?: string;
      geography_id?: string;
    };
    public_metadata: Record<string, unknown>;
  };
  type: string;
}

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return new Response("Ignored event type", { status: 200 });
  }

  const { data } = event;
  const email = data.email_addresses[0]?.email_address;
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
  const role = data.private_metadata?.role || "champion";

  const supabase = getSupabaseAdminClient();

  const profileData: Record<string, unknown> = {
    clerk_user_id: data.id,
    email,
    full_name: fullName,
    role,
    is_active: true,
  };

  if (
    data.private_metadata &&
    Object.hasOwn(data.private_metadata, "geography_id")
  ) {
    profileData.geography_id = data.private_metadata.geography_id ?? null;
  }

  const { error } = await supabase.from("profiles").upsert(
    profileData,
    { onConflict: "clerk_user_id" }
  );

  if (error) {
    console.error("Profile sync failed:", error);
    return new Response("Profile sync failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
