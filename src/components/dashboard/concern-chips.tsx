"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CONCERNS,
  CONCERN_LABELS,
  type Concern,
} from "@/lib/constants/pipeline";
import { updateConcerns } from "@/lib/actions/pipeline";

interface ConcernChipsProps {
  prospectId: string;
  activeConcerns: string[];
}

export function ConcernChips({
  prospectId,
  activeConcerns,
}: ConcernChipsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const availableConcerns = CONCERNS.filter(
    (c) => !activeConcerns.includes(c)
  );

  const handleRemove = async (concern: string) => {
    setPending(true);
    const updated = activeConcerns.filter((c) => c !== concern);

    const result = await updateConcerns({
      prospect_id: prospectId,
      concerns: updated,
    });

    setPending(false);

    if (result.success) {
      router.refresh();
    }
  };

  const handleAdd = async (concern: Concern) => {
    setPending(true);
    setDropdownOpen(false);
    const updated = [...activeConcerns, concern];

    const result = await updateConcerns({
      prospect_id: prospectId,
      concerns: updated,
    });

    setPending(false);

    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div>
      <h4 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
        Concerns
      </h4>

      <div className={`flex flex-wrap gap-1.5 ${pending ? "opacity-50" : ""}`}>
        {activeConcerns.map((concern) => (
          <span
            key={concern}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-pill bg-paper-3 text-ink-3 border border-line"
          >
            {CONCERN_LABELS[concern as Concern] ?? concern}
            <button
              type="button"
              onClick={() => handleRemove(concern)}
              disabled={pending}
              className="text-ink-4 hover:text-danger transition-colors"
              aria-label={`Remove ${CONCERN_LABELS[concern as Concern] ?? concern}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Add button */}
        {availableConcerns.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={pending}
              className="inline-flex items-center px-2 py-1 text-xs rounded-pill border border-dashed border-line text-ink-4 hover:text-ink hover:border-ink-3 transition-colors"
            >
              <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-paper border border-line rounded-sm shadow-md py-1 min-w-[160px]">
                {availableConcerns.map((concern) => (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => handleAdd(concern)}
                    className="block w-full text-left px-3 py-1.5 text-xs text-ink hover:bg-paper-2 transition-colors"
                  >
                    {CONCERN_LABELS[concern]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {activeConcerns.length === 0 && !dropdownOpen && (
        <p className="text-xs text-ink-4 mt-1">
          No concerns recorded. Tap + to add.
        </p>
      )}
    </div>
  );
}
