"use client";

import { useState, useCallback } from "react";
import { SendComposer } from "@/components/dashboard/send-composer";

export interface LibraryItem {
  id: string;
  type: string;
  title: string;
  body: string;
  author?: string | null;
  concern: string | null;
  send_count?: number;
}

interface LibraryAccordionProps {
  items: LibraryItem[];
  prospects: {
    id: string;
    parent_first: string;
    parent_last: string;
    email: string | null;
  }[];
}

const TYPE_LABELS: Record<string, string> = {
  faq: "FAQ",
  quote: "Testimonial",
  talking: "Talking Point",
  data: "Data & Reports",
};

const TYPE_ACCENT_CLASSES: Record<string, string> = {
  faq: "border-l-alpha-blue",
  quote: "border-l-alpha-coral",
  talking: "border-l-alpha-sun",
  data: "border-l-success",
};

const TYPE_LABEL_CLASSES: Record<string, string> = {
  faq: "text-alpha-blue",
  quote: "text-alpha-coral",
  talking: "text-warning",
  data: "text-success",
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "w-5 h-5 shrink-0 text-ink-4 transition-transform duration-200",
        open ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function LibraryCard({
  item,
  onSend,
}: {
  item: LibraryItem;
  onSend: (item: LibraryItem) => void;
}) {
  const accentClass = TYPE_ACCENT_CLASSES[item.type] ?? "border-l-ink-3";
  const labelClass = TYPE_LABEL_CLASSES[item.type] ?? "text-ink-3";

  return (
    <div
      className={`bg-paper rounded-xl border border-line border-l-4 ${accentClass} p-5 flex flex-col transition-all hover:shadow-md hover:-translate-y-px cursor-pointer`}
      onClick={() => onSend(item)}
    >
      {/* Type label */}
      <div
        className={`font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.14em] uppercase mb-2 ${labelClass}`}
      >
        {TYPE_LABELS[item.type] ?? item.type}
      </div>

      {/* Content */}
      {item.type === "quote" ? (
        <>
          <div className="font-[family-name:var(--font-editorial)] italic text-lg leading-snug text-ink-2 mb-3">
            &ldquo;{item.body}&rdquo;
          </div>
          {item.author && (
            <div className="text-xs text-ink-3 font-[family-name:var(--font-display)] font-semibold">
              — {item.author}
            </div>
          )}
        </>
      ) : (
        <>
          <h4 className="font-[family-name:var(--font-display)] font-bold text-[15px] tracking-tight leading-snug text-ink mb-1.5">
            {item.title}
          </h4>
          <p className="text-[13px] leading-relaxed text-ink-3 line-clamp-3 mb-3">
            {item.body}
          </p>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-line/50 flex items-center justify-between">
        <span className="text-[11px] text-ink-4">
          {item.send_count ?? 0} sends
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSend(item);
          }}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-alpha-blue text-alpha-blue bg-white hover:bg-alpha-blue hover:text-white transition-colors"
        >
          Send &rarr;
        </button>
      </div>
    </div>
  );
}

export function LibraryAccordion({ items, prospects }: LibraryAccordionProps) {
  const [openType, setOpenType] = useState<string | null>(null);
  const [composerItem, setComposerItem] = useState<LibraryItem | null>(null);

  const types = ["faq", "quote", "talking", "data"];
  const groupedItems = types
    .map((type) => ({
      type,
      label: TYPE_LABELS[type] ?? type,
      items: items.filter((i) => i.type === type),
    }))
    .filter((g) => g.items.length > 0);

  const toggle = useCallback((type: string) => {
    setOpenType((prev) => (prev === type ? null : type));
  }, []);

  const handleSend = useCallback((item: LibraryItem) => {
    setComposerItem(item);
  }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-ink-4" data-testid="library-empty">
        <p className="text-sm">No items yet</p>
        <p className="text-xs mt-1">Library items will appear here once added.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-line rounded-xl overflow-hidden divide-y divide-line">
        {groupedItems.map((group) => {
          const isOpen = openType === group.type;
          return (
            <div key={group.type} data-testid={`library-group-${group.type}`}>
              <button
                type="button"
                onClick={() => toggle(group.type)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-paper-2 transition-colors duration-100"
              >
                <span className="font-[family-name:var(--font-display)] font-bold text-[16px] tracking-[-0.01em] text-ink">
                  {group.label}
                  <span className="ml-2 text-[12px] font-medium text-ink-4">
                    ({group.items.length})
                  </span>
                </span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="px-6 pb-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <LibraryCard
                        key={item.id}
                        item={item}
                        onSend={handleSend}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SendComposer modal */}
      {composerItem && (
        <SendComposer
          libraryItem={composerItem}
          prospects={prospects}
          onClose={() => setComposerItem(null)}
        />
      )}
    </>
  );
}
