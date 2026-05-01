import { auth } from "@clerk/nextjs/server";
import { HubShell } from "@/components/hub/hub-shell";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <HubShell isAuthenticated={isAuthenticated}>
      {children}
    </HubShell>
  );
}
