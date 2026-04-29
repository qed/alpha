import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLeaderboardPage() {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.role as string | undefined;

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        Leaderboard
      </h1>
      <p className="mt-2 text-ink-3">Admin leaderboard — coming in Unit 6.</p>
    </div>
  );
}
