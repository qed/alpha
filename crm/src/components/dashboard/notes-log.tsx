"use client";

import { useState } from "react";
import { addNote } from "@/lib/actions/prospects";

interface Note {
  id: string;
  body: string;
  created_at: string;
  author_name: string;
}

interface NotesLogProps {
  notes: Note[];
  prospectId: string;
  onNoteAdded: () => void;
}

export function NotesLog({ notes, prospectId, onNoteAdded }: NotesLogProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);

    const result = await addNote({ prospect_id: prospectId, body });
    setSubmitting(false);

    if (result.success) {
      setBody("");
      onNoteAdded();
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink mb-3">Notes</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add a note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          className="flex-1 px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="px-4 py-2 text-sm font-medium bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {notes.length === 0 ? (
        <p className="text-sm text-ink-3">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="border-b border-line pb-3 last:border-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-ink">
                  {note.author_name}
                </span>
                <span className="text-xs text-ink-3">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-ink">{note.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
