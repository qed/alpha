import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Alpha Hub",
  description:
    "Enroll your family at Alpha School — the future of education across 53 cities.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await auth();
  const { userId, sessionClaims } = authResult;

  console.log("[dashboard-layout] auth() result:", JSON.stringify({ userId, sessionClaims, keys: Object.keys(authResult) }));

  if (!userId) {
    redirect("/hub");
  }

  const role = sessionClaims?.role as string | undefined;
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-paper-2">
      <header className="bg-paper border-b border-line px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            href={isAdmin ? "/hub/leaderboard" : "/hub/dashboard"}
            className="font-[family-name:var(--font-display)] text-lg font-bold text-ink no-underline"
          >
            Alpha Hub
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/hub/leaderboard"
                className="text-sm text-ink-3 hover:text-ink no-underline"
              >
                Leaderboard
              </Link>
              <Link
                href="/hub/champions"
                className="text-sm text-ink-3 hover:text-ink no-underline"
              >
                Champions
              </Link>
            </>
          )}
          <Link
            href={isAdmin ? "/hub/leaderboard" : "/hub/prospects"}
            className="text-sm text-ink-3 hover:text-ink no-underline"
          >
            {isAdmin ? "All Geographies" : "Prospects"}
          </Link>
        </nav>
        <UserButton />
      </header>
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
