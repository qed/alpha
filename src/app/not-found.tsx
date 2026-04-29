import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-ink mb-4">
        404
      </h1>
      <p className="text-lg text-ink-3 mb-10">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <nav className="flex justify-center gap-6">
        <Link
          href="/"
          className="text-alpha-blue hover:underline no-underline font-medium"
        >
          Home
        </Link>
        <Link
          href="/v1"
          className="text-alpha-blue hover:underline no-underline font-medium"
        >
          Parent Stories
        </Link>
        <Link
          href="/hub/sign-in"
          className="text-alpha-blue hover:underline no-underline font-medium"
        >
          Sign In
        </Link>
      </nav>
    </div>
  );
}
