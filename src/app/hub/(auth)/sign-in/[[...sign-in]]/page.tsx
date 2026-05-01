import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-2">
      <SignIn
        forceRedirectUrl="/hub"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md rounded-md",
            headerTitle: "font-[family-name:var(--font-display)] font-bold",
            formButtonPrimary: "bg-alpha-blue hover:bg-alpha-blue-600",
          },
        }}
      />
    </main>
  );
}
