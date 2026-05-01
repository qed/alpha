import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
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
    </div>
  );
}
