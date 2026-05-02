"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPipelineProspect } from "@/lib/actions/pipeline";

interface AddProspectModalProps {
  open: boolean;
  onClose: () => void;
  neighborhoods: string[];
}

export function AddProspectModal({
  open,
  onClose,
  neighborhoods,
}: AddProspectModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [spouse, setSpouse] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [source, setSource] = useState("");
  const [showNeighborhoodSuggestions, setShowNeighborhoodSuggestions] =
    useState(false);

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.toLowerCase().includes(neighborhood.toLowerCase())
  );

  const resetForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSpouse("");
    setNeighborhood("");
    setSource("");
    setError(null);
  }, []);

  // Focus trap & escape handling
  useEffect(() => {
    if (!open) return;

    // Focus first input on open
    setTimeout(() => firstInputRef.current?.focus(), 0);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Simple focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: Record<string, string | undefined> = {
      parent_first: firstName,
      parent_last: lastName,
    };
    if (email) payload.parent_email = email;
    if (phone) payload.parent_phone = phone;
    if (spouse) payload.spouse_name = spouse;
    if (neighborhood) payload.neighborhood = neighborhood;
    if (source) payload.source = source;

    const result = await createPipelineProspect(payload);

    if (result.success) {
      resetForm();
      onClose();
      router.refresh();
    } else {
      setError(result.error || "Failed to create prospect.");
    }

    setSubmitting(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Add prospect"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative bg-paper rounded-md shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
            Add Prospect
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-sm text-sm text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prospect-first"
                className="block text-sm font-medium text-ink mb-1"
              >
                First name *
              </label>
              <input
                ref={firstInputRef}
                id="prospect-first"
                type="text"
                required
                maxLength={100}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="prospect-last"
                className="block text-sm font-medium text-ink mb-1"
              >
                Last name *
              </label>
              <input
                id="prospect-last"
                type="text"
                required
                maxLength={100}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="prospect-email"
              className="block text-sm font-medium text-ink mb-1"
            >
              Email
            </label>
            <input
              id="prospect-email"
              type="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prospect-phone"
                className="block text-sm font-medium text-ink mb-1"
              >
                Phone
              </label>
              <input
                id="prospect-phone"
                type="text"
                maxLength={20}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="prospect-spouse"
                className="block text-sm font-medium text-ink mb-1"
              >
                Spouse
              </label>
              <input
                id="prospect-spouse"
                type="text"
                maxLength={200}
                value={spouse}
                onChange={(e) => setSpouse(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="prospect-neighborhood"
              className="block text-sm font-medium text-ink mb-1"
            >
              Neighborhood
            </label>
            <input
              id="prospect-neighborhood"
              type="text"
              maxLength={100}
              value={neighborhood}
              onChange={(e) => {
                setNeighborhood(e.target.value);
                setShowNeighborhoodSuggestions(true);
              }}
              onFocus={() => setShowNeighborhoodSuggestions(true)}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowNeighborhoodSuggestions(false), 150);
              }}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
              disabled={submitting}
              autoComplete="off"
            />
            {showNeighborhoodSuggestions &&
              neighborhood.length > 0 &&
              filteredNeighborhoods.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-paper border border-line rounded-sm shadow-md max-h-32 overflow-y-auto">
                  {filteredNeighborhoods.map((n) => (
                    <li key={n}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setNeighborhood(n);
                          setShowNeighborhoodSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-paper-2"
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          <div>
            <label
              htmlFor="prospect-source"
              className="block text-sm font-medium text-ink mb-1"
            >
              Source
            </label>
            <input
              id="prospect-source"
              type="text"
              maxLength={100}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Referral, Event, Social"
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-ink-3 border border-line rounded-sm hover:bg-paper-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-semibold bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add Prospect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
