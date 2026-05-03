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

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(async (item: LibraryItem) => {
    const text = `${item.title}\n\n${item.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

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
  const [openConcerns, setOpenConcerns] = useState<Set<string>>(new Set());

  const toggleConcern = useCallback((concern: string) => {
    setOpenConcerns((prev) => {
      const next = new Set(prev);
      if (next.has(concern)) {
        next.delete(concern);
      } else {
        next.add(concern);
      }
      return next;
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Answers to concerns"
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
            Answers to Concerns
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
            Array.from(itemsByConcern.entries()).map(([concern, items]) => {
              const isOpen = openConcerns.has(concern);
              const sentCount = items.filter((i) => sentIds.has(i.id)).length;

              return (
                <div key={concern} className="border border-line rounded-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-paper-2 hover:bg-paper-3 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-ink">
                      {CONCERN_LABELS[concern as Concern] ?? concern}
                    </span>
                    <span className="flex items-center gap-2">
                      {sentCount > 0 && (
                        <span className="text-xs text-success">
                          {sentCount}/{items.length} sent
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-ink-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 py-3 space-y-3 border-t border-line">
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

                              <div className="shrink-0 flex flex-col gap-1.5">
                                <button
                                  type="button"
                                  disabled={isSent || isPending}
                                  onClick={() => handleMarkAsSent(item.id)}
                                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                                    isSent
                                      ? "bg-success/10 text-success border border-success/20 cursor-default"
                                      : "text-white bg-alpha-blue hover:bg-alpha-blue-600"
                                  }`}
                                >
                                  {isSent ? "Sent ✓" : "Mark as sent"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(item)}
                                  className="px-3 py-1 text-xs font-medium rounded-sm border border-line text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors flex items-center justify-center gap-1"
                                  aria-label={`Copy ${item.title}`}
                                >
                                  {copiedId === item.id ? (
                                    <>
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                      Copy text
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
