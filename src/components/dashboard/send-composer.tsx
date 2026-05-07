"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { recordLibrarySend } from "@/lib/actions/pipeline";
import { useToast } from "@/components/ui/toast";

const CHANNELS = ["email", "sms", "whatsapp", "link"] as const;
type Channel = (typeof CHANNELS)[number];

const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  link: "Copy link",
};

interface SendComposerProps {
  libraryItem: { id: string; title: string; body: string; type: string };
  prospect?: {
    id: string;
    parent_first: string;
    parent_last: string;
    email: string | null;
  };
  prospects: {
    id: string;
    parent_first: string;
    parent_last: string;
    email: string | null;
  }[];
  onClose: () => void;
}

export function SendComposer({
  libraryItem,
  prospect,
  prospects,
  onClose,
}: SendComposerProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [channel, setChannel] = useState<Channel>("email");
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(
    prospect?.id ?? null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [autoLogSignal, setAutoLogSignal] = useState(true);
  const [sending, setSending] = useState(false);

  const selectedProspect = useMemo(() => {
    if (prospect && selectedProspectId === prospect.id) return prospect;
    return prospects.find((p) => p.id === selectedProspectId) ?? null;
  }, [prospect, prospects, selectedProspectId]);

  const firstName = selectedProspect?.parent_first ?? "friend";

  const defaultSubject = `For you, ${firstName}: ${libraryItem.title}`;
  const [subject, setSubject] = useState(defaultSubject);

  const defaultBody = `Hi ${firstName},\n\nThinking of our last conversation — I wanted to share this:\n\n${libraryItem.title}\n\n${libraryItem.body}\n\nHappy to chat about this anytime.`;
  const [body, setBody] = useState(defaultBody);

  const filteredProspects = useMemo(() => {
    if (!searchQuery.trim()) return prospects;
    const q = searchQuery.toLowerCase();
    return prospects.filter(
      (p) =>
        p.parent_first.toLowerCase().includes(q) ||
        p.parent_last.toLowerCase().includes(q) ||
        `${p.parent_first} ${p.parent_last}`.toLowerCase().includes(q)
    );
  }, [prospects, searchQuery]);

  const handleSend = useCallback(async () => {
    if (!selectedProspectId) return;
    setSending(true);

    const result = await recordLibrarySend({
      prospect_id: selectedProspectId,
      library_item_id: libraryItem.id,
      channel,
      auto_log_signal: autoLogSignal,
    });

    if (result.success) {
      // Copy message to clipboard
      const clipboardText =
        channel === "email"
          ? `Subject: ${subject}\n\n${body}`
          : body;

      try {
        await navigator.clipboard.writeText(clipboardText);
        showToast("Copied to clipboard & logged!", "success");
      } catch {
        showToast("Logged! (clipboard not available)", "success");
      }

      onClose();
      router.refresh();
    } else {
      showToast(result.error || "Failed to send.", "error");
      setSending(false);
    }
  }, [
    selectedProspectId,
    libraryItem.id,
    channel,
    autoLogSignal,
    subject,
    body,
    onClose,
    router,
    showToast,
  ]);

  const contactLabel = selectedProspect
    ? `${selectedProspect.parent_first} ${selectedProspect.parent_last}`
    : "contact";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-10"
      role="dialog"
      aria-modal="true"
      aria-label="Send from library"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        data-testid="send-composer-backdrop"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl w-[720px] max-w-full max-h-[90vh] overflow-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-line flex justify-between items-center">
          <div>
            <div className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.16em] uppercase text-alpha-blue mb-1">
              Send from library
            </div>
            <h3 className="font-[family-name:var(--font-display)] font-extrabold text-lg tracking-tight m-0">
              {libraryItem.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink p-1"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* To field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.14em] uppercase text-ink-4">
              To
            </label>
            {prospect ? (
              <input
                type="text"
                readOnly
                value={`${prospect.parent_first} ${prospect.parent_last}${prospect.email ? ` · ${prospect.email}` : ""}`}
                className="text-sm px-3 py-2.5 rounded-lg border border-line bg-paper-2 text-ink cursor-default"
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={
                    selectedProspect && !searchQuery
                      ? `${selectedProspect.parent_first} ${selectedProspect.parent_last}`
                      : searchQuery
                  }
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedProspectId) setSelectedProspectId(null);
                  }}
                  placeholder="Search contacts..."
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-line bg-white text-ink focus:outline-none focus:border-alpha-blue focus:ring-2 focus:ring-alpha-blue/10"
                  data-testid="send-composer-to-input"
                />
                {!selectedProspectId && searchQuery && filteredProspects.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-lg shadow-md max-h-48 overflow-y-auto z-10">
                    {filteredProspects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProspectId(p.id);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-paper-2 transition-colors"
                      >
                        {p.parent_first} {p.parent_last}
                        {p.email && (
                          <span className="text-ink-4 ml-2">{p.email}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Channel toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.14em] uppercase text-ink-4">
              Channel
            </label>
            <div className="flex gap-2" data-testid="channel-toggle">
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    channel === ch
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-ink-2 border-line hover:border-ink-4"
                  }`}
                  data-testid={`channel-${ch}`}
                >
                  {CHANNEL_LABELS[ch]}
                </button>
              ))}
            </div>
          </div>

          {/* Subject (email only) */}
          {channel === "email" && (
            <div className="flex flex-col gap-1.5" data-testid="subject-field">
              <label className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.14em] uppercase text-ink-4">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-sm px-3 py-2.5 rounded-lg border border-line bg-white text-ink focus:outline-none focus:border-alpha-blue focus:ring-2 focus:ring-alpha-blue/10"
              />
            </div>
          )}

          {/* Message body */}
          <div className="flex flex-col gap-1.5">
            <label className="font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.14em] uppercase text-ink-4">
              Message{" "}
              <span className="normal-case tracking-normal font-medium text-ink-4">
                · personalize freely, link auto-tracked
              </span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="text-sm px-3 py-2.5 rounded-lg border border-line bg-white text-ink min-h-[200px] resize-y leading-relaxed focus:outline-none focus:border-alpha-blue focus:ring-2 focus:ring-alpha-blue/10"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-line">
            <label className="flex items-center gap-2 text-[13px] text-ink-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLogSignal}
                onChange={(e) => setAutoLogSignal(e.target.checked)}
                className="rounded"
                data-testid="auto-log-checkbox"
              />
              Auto-log as &quot;Sent FAQ&quot; on {contactLabel}
            </label>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm font-semibold rounded-lg border border-line bg-white text-ink hover:bg-paper-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !selectedProspectId}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-alpha-blue text-white hover:bg-alpha-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              data-testid="send-and-log-btn"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11l18-8-8 18-2-8z" />
              </svg>
              Send &amp; log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
