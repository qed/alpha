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
    redirect("/hub");
  }

  const rawRole = sessionClaims?.role as string | undefined;
  const role = rawRole === "admin" ? "admin" : "champion";
  const rawGeo = sessionClaims?.geography_id as string | undefined;
  const geographyId = rawGeo && !rawGeo.startsWith("{{") ? rawGeo : null;

  return { userId, role, geographyId };
}

export async function requireAdmin(): Promise<SessionInfo> {
  const session = await requireAuth();
  if (session.role !== "admin") {
    redirect("/hub/dashboard");
  }
  return session;
}

export async function requireAuthenticated(): Promise<SessionInfo> {
  return requireAuth();
}
