"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignalGrid } from "./signal-grid";
import { ConcernChips } from "./concern-chips";
import { HeatPips } from "./heat-pips";
import { overrideHeat, addPipelineNote } from "@/lib/actions/pipeline";
import { suggestHeat } from "@/lib/pipeline/copilot-engine";
import type { SelectedProspectDetail } from "./contact-drawer";

interface DrawerAsideProps {
  prospect: SelectedProspectDetail;
}

import { daysSince } from "@/lib/utils/dates";

export function DrawerAside({ prospect }: DrawerAsideProps) {
  const router = useRouter();
  const [noteBody, setNoteBody] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const suggestedHeat = suggestHeat(
    prospect.engagement_signals,
    daysSince(prospect.last_touch_at),
    prospect.status
  );

  const handleHeatOverride = async (newHeat: number) => {
    const result = await overrideHeat({
      prospect_id: prospect.id,
      heat_score: newHeat,
    });

    if (result.success) {
      router.refresh();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    setSubmittingNote(true);
    setNoteError(null);

    const result = await addPipelineNote({
      prospect_id: prospect.id,
      body: noteBody,
    });

    setSubmittingNote(false);

    if (result.success) {
      setNoteBody("");
      router.refresh();
    } else {
      setNoteError(result.error || "Failed to add note.");
    }
  };

  return (
    <div className="p-5 space-y-6">
      {/* About section */}
      <div>
        <h4 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
          About
        </h4>
        <dl className="text-sm space-y-1.5">
          {prospect.parent_email && (
            <div className="flex gap-2">
              <dt className="text-ink-4 shrink-0 w-14">Email</dt>
              <dd className="text-ink truncate">
                <a
                  href={`mailto:${prospect.parent_email}`}
                  className="hover:text-alpha-blue transition-colors"
                >
                  {prospect.parent_email}
                </a>
              </dd>
            </div>
          )}
          {prospect.parent_phone && (
            <div className="flex gap-2">
              <dt className="text-ink-4 shrink-0 w-14">Phone</dt>
              <dd className="text-ink">
                <a
                  href={`tel:${prospect.parent_phone}`}
                  className="hover:text-alpha-blue transition-colors"
                >
                  {prospect.parent_phone}
                </a>
              </dd>
            </div>
          )}
          {prospect.spouse_name && (
            <div className="flex gap-2">
              <dt className="text-ink-4 shrink-0 w-14">Spouse</dt>
              <dd className="text-ink">{prospect.spouse_name}</dd>
            </div>
          )}
          {prospect.source && (
            <div className="flex gap-2">
              <dt className="text-ink-4 shrink-0 w-14">Source</dt>
              <dd className="text-ink">{prospect.source}</dd>
            </div>
          )}
          {prospect.postal_code && (
            <div className="flex gap-2">
              <dt className="text-ink-4 shrink-0 w-14">Postal</dt>
              <dd className="text-ink">{prospect.postal_code}</dd>
            </div>
          )}
          {prospect.children.length > 0 && (
            <div className="flex gap-2">
              <dt className="text-ink-4 shrink-0 w-14">Kids</dt>
              <dd className="text-ink space-y-0.5">
                {prospect.children.map((c) => (
                  <div key={c.id}>
                    {c.first_name}
                    {c.grade && <span className="text-ink-4"> — Grade {c.grade}</span>}
                  </div>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Signal Grid */}
      <SignalGrid
        prospectId={prospect.id}
        activeSignals={prospect.engagement_signals}
      />

      {/* Concern Chips */}
      <ConcernChips
        prospectId={prospect.id}
        activeConcerns={prospect.concerns}
      />

      {/* Heat Pips (detailed, with auto-suggest) */}
      <div>
        <h4 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
          Heat Score
        </h4>
        <HeatPips
          score={prospect.heat_score}
          suggestedScore={suggestedHeat}
          onOverride={handleHeatOverride}
          size="md"
        />
        <p className="text-[10px] text-ink-4 mt-1">
          Auto-suggested: {suggestedHeat}/5. Click a pip to override.
        </p>
      </div>

      {/* Notes */}
      <div>
        <h4 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
          Private Notes
        </h4>

        {prospect.notes.length > 0 && (
          <ul className="space-y-2 mb-3">
            {prospect.notes.slice(0, 5).map((note) => (
              <li key={note.id} className="text-sm">
                <p className="font-[family-name:var(--font-editorial)] italic text-ink leading-snug">
                  {note.body}
                </p>
                <span className="text-[10px] text-ink-4 block mt-0.5">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}

        {noteError && (
          <p className="text-xs text-danger mb-2">{noteError}</p>
        )}

        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            data-notes-input
            type="text"
            placeholder="Add a note..."
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            maxLength={2000}
            className="flex-1 px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
          />
          <button
            type="submit"
            disabled={submittingNote || !noteBody.trim()}
            className="px-3 py-2 text-xs font-medium bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
