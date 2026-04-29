import Link from "next/link";

interface Props {
  params: Promise<{ geography: string }>;
}

export default async function ConfirmationPage({ params }: Props) {
  const { geography } = await params;

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Thank you for your interest!
        </h1>
        <p className="mt-3 text-ink-3">
          Your information has been received. A local Alpha School champion will
          reach out to you soon to discuss next steps.
        </p>
        <Link
          href={`/${geography}`}
          className="inline-block mt-6 text-sm text-alpha-blue hover:text-alpha-blue-600"
        >
          &larr; Back to form
        </Link>
      </div>
    </main>
  );
}
