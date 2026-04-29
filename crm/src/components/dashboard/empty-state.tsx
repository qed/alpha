import { CopyLinkButton } from "./copy-link-button";

interface EmptyStateProps {
  geographySlug: string;
  geographyName: string;
}

export function EmptyState({ geographySlug, geographyName }: EmptyStateProps) {
  return (
    <div className="bg-paper rounded-md border border-line p-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-alpha-blue/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-alpha-blue"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-2">
        Welcome to {geographyName}!
      </h2>
      <p className="text-ink-3 mb-6 max-w-md mx-auto">
        No families have signed up yet. Share your intake link with interested
        families to start building your enrollment pipeline.
      </p>
      <div className="flex flex-col items-center gap-4">
        <CopyLinkButton geographySlug={geographySlug} />
        <div className="text-left max-w-sm">
          <h3 className="text-sm font-semibold text-ink mb-2">Next steps:</h3>
          <ol className="text-sm text-ink-3 space-y-1 list-decimal list-inside">
            <li>Share the intake link with prospective families</li>
            <li>Follow up with interested families promptly</li>
            <li>Schedule shadow days for serious prospects</li>
            <li>
              Reach 25 committed or enrolled children to launch
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
