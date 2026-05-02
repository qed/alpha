import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/set-admin.ts <email>");
  process.exit(1);
}

async function main() {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, clerk_user_id, role")
    .eq("email", email)
    .single();

  if (error || !profile) {
    console.error("Profile not found for", email);
    process.exit(1);
  }

  if (profile.role === "admin") {
    console.log(`${email} is already an admin.`);
    process.exit(0);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError.message);
    process.exit(1);
  }

  console.log(`Updated Supabase profile to admin for ${email}`);

  const res = await fetch(`https://api.clerk.com/v1/users/${profile.clerk_user_id}/metadata`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      private_metadata: { role: "admin" },
    }),
  });

  if (!res.ok) {
    console.error("Clerk API error:", res.status, await res.text());
    process.exit(1);
  }

  console.log("Done. Refresh the browser to pick up the new session.");
}

main();
