import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HubPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/hub/sign-in");
  }

  const role = sessionClaims?.role as string | undefined;

  if (role === "admin") {
    redirect("/hub/leaderboard");
  }

  if (role === "champion") {
    redirect("/hub/dashboard");
  }

  redirect("/hub/sign-in");
}
