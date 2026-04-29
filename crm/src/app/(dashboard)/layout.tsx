import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = sessionClaims?.role as string | undefined;
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-paper-2">
      <header className="bg-paper border-b border-line px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            href={isAdmin ? "/leaderboard" : "/dashboard"}
            className="font-[family-name:var(--font-display)] text-lg font-bold text-ink no-underline"
          >
            Alpha Enrollment
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/leaderboard"
                className="text-sm text-ink-3 hover:text-ink no-underline"
              >
                Leaderboard
              </Link>
              <Link
                href="/champions"
                className="text-sm text-ink-3 hover:text-ink no-underline"
              >
                Champions
              </Link>
            </>
          )}
          <Link
            href={isAdmin ? "/leaderboard" : "/prospects"}
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
