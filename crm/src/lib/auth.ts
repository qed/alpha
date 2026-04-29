import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export interface SessionInfo {
  userId: string;
  role: "admin" | "champion";
  geographyId: string | null;
}

export async function requireAuth(): Promise<SessionInfo> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = (sessionClaims?.role as string) || "champion";
  const geographyId = (sessionClaims?.geography_id as string) || null;

  if (role !== "admin" && role !== "champion") {
    redirect("/sign-in");
  }

  return { userId, role: role as "admin" | "champion", geographyId };
}

export async function requireAdmin(): Promise<SessionInfo> {
  const session = await requireAuth();
  if (session.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export async function requireChampion(): Promise<SessionInfo & { geographyId: string }> {
  const session = await requireAuth();
  if (!session.geographyId) {
    redirect("/sign-in");
  }
  return session as SessionInfo & { geographyId: string };
}
