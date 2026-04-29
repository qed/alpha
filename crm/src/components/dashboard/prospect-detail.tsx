"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { NotesLog } from "./notes-log";
import {
  updateProspectStatus,
  setFollowUpDate as setFollowUpDateAction,
} from "@/lib/actions/prospects";
import {
  ALLOWED_TRANSITIONS,
  STAGE_LABELS,
  type PipelineStage,
} from "@/lib/constants/pipeline";

interface Child {
  id: string;
  first_name: string;
  grade: string | null;
  age: number | null;
  gender: string | null;
}

interface Note {
  id: string;
  body: string;
  created_at: string;
  author_name: string;
}

export interface ProspectDetailData {
  id: string;
  parent_first: string;
  parent_last: string;
  parent_email: string;
  parent_phone: string | null;
  spouse_name: string | null;
  source: string | null;
  status: PipelineStage;
  follow_up_date: string | null;
  first_responded_at: string | null;
  created_at: string;
  updated_at: string;
  children: Child[];
  notes: Note[];
}

interface ProspectDetailProps {
  prospect: ProspectDetailData;
}

export function ProspectDetail({ prospect }: ProspectDetailProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(
    prospect.follow_up_date || ""
  );

  const allowedTransitions = ALLOWED_TRANSITIONS[prospect.status];

  const handleStatusChange = async (newStatus: PipelineStage) => {
    setError(null);
    setUpdatingStatus(true);

    const result = await updateProspectStatus({
      prospect_id: prospect.id,
      new_status: newStatus,
      updated_at: prospect.updated_at,
    });

    setUpdatingStatus(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to update status.");
    }
  };

  const handleFollowUpChange = async (date: string) => {
    setFollowUpDate(date);
    setError(null);

    const result = await setFollowUpDateAction({
      prospect_id: prospect.id,
      follow_up_date: date || null,
      updated_at: prospect.updated_at,
    });

    if (!result.success) {
      setError(result.error || "Failed to update follow-up date.");
      setFollowUpDate(prospect.follow_up_date || "");
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-sm text-sm text-danger">
          {error}
        </div>
      )}

      <div className="bg-paper rounded-md border border-line p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
              {prospect.parent_first} {prospect.parent_last}
            </h2>
            <p className="text-sm text-ink-3 mt-1">{prospect.parent_email}</p>
            {prospect.parent_phone && (
              <p className="text-sm text-ink-3">{prospect.parent_phone}</p>
            )}
            {prospect.spouse_name && (
              <p className="text-sm text-ink-3">
                Spouse: {prospect.spouse_name}
              </p>
            )}
            {prospect.source && (
              <p className="text-sm text-ink-3">Source: {prospect.source}</p>
            )}
          </div>
          <StatusBadge stage={prospect.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value=""
              onChange={(e) =>
                handleStatusChange(e.target.value as PipelineStage)
              }
              disabled={updatingStatus || allowedTransitions.length === 0}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue bg-paper"
            >
              <option value="" disabled>
                Move to...
              </option>
              {allowedTransitions.map((stage) => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => handleFollowUpChange(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
            />
          </div>
        </div>

        <div className="mt-4 text-xs text-ink-3">
          Added {new Date(prospect.created_at).toLocaleDateString()}
          {prospect.first_responded_at &&
            ` · First responded ${new Date(prospect.first_responded_at).toLocaleDateString()}`}
        </div>
      </div>

      <div className="bg-paper rounded-md border border-line p-6">
        <h3 className="text-sm font-semibold text-ink mb-3">
          Children ({prospect.children.length})
        </h3>
        {prospect.children.length === 0 ? (
          <p className="text-sm text-ink-3">No children recorded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prospect.children.map((child) => (
              <div
                key={child.id}
                className="p-3 bg-paper-2 rounded-sm border border-line"
              >
                <span className="font-medium text-sm text-ink">
                  {child.first_name}
                </span>
                <div className="text-xs text-ink-3 mt-1">
                  {[
                    child.age && `Age ${child.age}`,
                    child.grade && `Grade: ${child.grade}`,
                    child.gender && child.gender !== "prefer-not-to-say"
                      ? child.gender
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-paper rounded-md border border-line p-6">
        <NotesLog
          notes={prospect.notes}
          prospectId={prospect.id}
          onNoteAdded={() => router.refresh()}
        />
      </div>
    </div>
  );
}
