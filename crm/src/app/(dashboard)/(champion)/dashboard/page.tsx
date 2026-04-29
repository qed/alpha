import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ChampionDashboardPage() {
  const { sessionClaims } = await auth();
  const geographyId = sessionClaims?.geography_id as string | undefined;

  if (!geographyId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        Dashboard
      </h1>
      <p className="mt-2 text-ink-3">Champion dashboard — coming in Unit 4.</p>
    </div>
  );
}
