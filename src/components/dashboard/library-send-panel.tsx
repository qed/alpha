"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { recordLibrarySend } from "@/lib/actions/pipeline";
import { useToast } from "@/components/ui/toast";
import {
  CONCERN_LABELS,
  type Concern,
} from "@/lib/constants/pipeline";
import type { LibraryItem, DrawerLibrarySend } from "./contact-drawer";

const TYPE_LABELS: Record<string, string> = {
  faq: "FAQ",
  talking: "Talking Point",
  data: "Data Point",
  quote: "Quote",
};

interface LibrarySendPanelProps {
  libraryItems: LibraryItem[];
  librarySends: DrawerLibrarySend[];
  prospectConcerns: string[];
  prospectId: string;
  onClose: () => void;
}

export function LibrarySendPanel({
  libraryItems,
  librarySends,
  prospectConcerns,
  prospectId,
  onClose,
}: LibrarySendPanelProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Track optimistically-sent items by library_item_id
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(
    () => new Set(librarySends.map((s) => s.library_item_id))
  );

  const handleMarkAsSent = useCallback(
    async (libraryItemId: string) => {
      // Optimistically mark as sent
      setPendingIds((prev) => new Set(prev).add(libraryItemId));
      setSentIds((prev) => new Set(prev).add(libraryItemId));

      const result = await recordLibrarySend({
        prospect_id: prospectId,
        library_item_id: libraryItemId,
      });

      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(libraryItemId);
        return next;
      });

      if (result.success) {
        router.refresh();
      } else {
        // Revert optimistic state
        setSentIds((prev) => {
          const next = new Set(prev);
          next.delete(libraryItemId);
          return next;
        });
        showToast(result.error || "Failed to record library send.", "error");
      }
    },
    [prospectId, router, showToast]
  );

  const concernSet = new Set(prospectConcerns);

  // Filter to items matching the prospect's concerns, then group by concern
  const itemsByConcern = new Map<string, LibraryItem[]>();
  for (const item of libraryItems) {
    if (item.concern === null || !concernSet.has(item.concern)) continue;
    const existing = itemsByConcern.get(item.concern);
    if (existing) {
      existing.push(item);
    } else {
      itemsByConcern.set(item.concern, [item]);
    }
  }

  const hasItems = itemsByConcern.size > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Send from library"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        data-testid="library-panel-backdrop"
      />

      {/* Panel */}
      <div className="relative bg-paper rounded-md shadow-lg w-full max-w-[640px] mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-line flex items-center justify-between sticky top-0 bg-paper z-10">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
            Send from Library
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          {!hasItems ? (
            <p className="text-sm text-ink-3 text-center py-8">
              No concerns recorded — add concerns to see relevant library items.
            </p>
          ) : (
            Array.from(itemsByConcern.entries()).map(([concern, items]) => (
              <div key={concern}>
                {/* Section header */}
                <h3 className="text-sm font-semibold text-ink mb-3">
                  {CONCERN_LABELS[concern as Concern] ?? concern}
                </h3>

                <div className="space-y-3">
                  {items.map((item) => {
                    const isSent = sentIds.has(item.id);
                    const isPending = pendingIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className="border border-line rounded-sm p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm text-ink">
                                {item.title}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium bg-alpha-blue/10 text-alpha-blue border border-alpha-blue/20">
                                {TYPE_LABELS[item.type] ?? item.type}
                              </span>
                            </div>
                            <p className="text-sm text-ink-3 mt-1">
                              {item.body}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isSent || isPending}
                            onClick={() => handleMarkAsSent(item.id)}
                            className={`shrink-0 px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                              isSent
                                ? "bg-success/10 text-success border border-success/20 cursor-default"
                                : "text-white bg-alpha-blue hover:bg-alpha-blue-600"
                            }`}
                          >
                            {isSent ? "Sent ✓" : "Mark as sent"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
