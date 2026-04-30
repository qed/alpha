"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChildFields } from "@/components/intake/child-fields";
import { createProspect } from "@/lib/actions/prospects";
import { SOURCE_OPTIONS } from "@/lib/validations/intake-schema";

interface ChildEntry {
  first_name: string;
  grade: string;
  age: string;
  gender: string;
}

export default function NewProspectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    parent_first: "",
    parent_last: "",
    parent_email: "",
    parent_phone: "",
    spouse_name: "",
    source: "",
  });

  const [children, setChildren] = useState<ChildEntry[]>([
    { first_name: "", grade: "", age: "", gender: "" },
  ]);

  const updateField = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createProspect({
      ...formState,
      children: children.map((c) => ({
        first_name: c.first_name,
        grade: c.grade || undefined,
        age: c.age ? parseInt(c.age) : undefined,
        gender: c.gender || undefined,
      })),
    });

    setSubmitting(false);

    if (result.success && result.prospectId) {
      router.push(`/hub/prospects/${result.prospectId}`);
    } else {
      setError(result.error || "Failed to create prospect.");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-6">
        Add Prospect
      </h1>

      {error && (
        <div className="p-3 mb-4 bg-danger/10 border border-danger/20 rounded-sm text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              First name *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formState.parent_first}
              onChange={(e) => updateField("parent_first", e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Last name *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formState.parent_last}
              onChange={(e) => updateField("parent_last", e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            maxLength={254}
            value={formState.parent_email}
            onChange={(e) => updateField("parent_email", e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Phone
            </label>
            <input
              type="tel"
              maxLength={20}
              value={formState.parent_phone}
              onChange={(e) => updateField("parent_phone", e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Spouse / partner name
            </label>
            <input
              type="text"
              maxLength={200}
              value={formState.spouse_name}
              onChange={(e) => updateField("spouse_name", e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Source
          </label>
          <select
            value={formState.source}
            onChange={(e) => updateField("source", e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue bg-paper"
          >
            <option value="">Select...</option>
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="Manual entry">Manual entry</option>
          </select>
        </div>

        <ChildFields entries={children} onChange={setChildren} />

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-alpha-blue text-white font-semibold rounded-sm hover:bg-alpha-blue-600 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Prospect"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/hub/prospects")}
            className="px-6 py-2 text-ink-3 border border-line rounded-sm hover:bg-paper-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
