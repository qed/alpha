import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/fix-clerk-metadata.ts <email>");
  process.exit(1);
}

async function main() {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("clerk_user_id, geography_id, role")
    .eq("email", email)
    .single();

  if (error || !profile) {
    console.error("Profile not found for", email);
    process.exit(1);
  }

  if (!profile.geography_id) {
    console.log("No geography assigned — nothing to sync.");
    process.exit(0);
  }

  console.log(`Syncing Clerk metadata: user=${profile.clerk_user_id} geography=${profile.geography_id}`);

  const res = await fetch(`https://api.clerk.com/v1/users/${profile.clerk_user_id}/metadata`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      private_metadata: {
        geography_id: profile.geography_id,
        role: profile.role,
      },
    }),
  });

  if (!res.ok) {
    console.error("Clerk API error:", res.status, await res.text());
    process.exit(1);
  }

  console.log("Done. Refresh the browser to pick up the new session.");
}

main();
