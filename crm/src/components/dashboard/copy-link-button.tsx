"use client";

import { useState, useCallback } from "react";

interface CopyLinkButtonProps {
  geographySlug: string;
}

export function CopyLinkButton({ geographySlug }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const basePath = process.env.__NEXT_ROUTER_BASEPATH || "/crm";
  const intakeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${basePath}/${geographySlug}`
      : `${basePath}/${geographySlug}`;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(intakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [intakeUrl]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-alpha-blue bg-alpha-blue/10 rounded-sm hover:bg-alpha-blue/20 transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Intake Link
        </>
      )}
    </button>
  );
}
