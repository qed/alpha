"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChildFields } from "./child-fields";
import { TurnstileWidget } from "./turnstile-widget";
import { submitIntakeForm } from "@/lib/actions/intake";
import { SOURCE_OPTIONS } from "@/lib/validations/intake-schema";

interface IntakeFormProps {
  geographySlug: string;
}

interface ChildEntry {
  first_name: string;
  grade: string;
  age: string;
  gender: string;
}

export function IntakeForm({ geographySlug }: IntakeFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [formState, setFormState] = useState({
    parent_first: "",
    parent_last: "",
    parent_email: "",
    parent_phone: "",
    spouse_name: "",
    source: "",
    consent: false,
  });

  const [children, setChildren] = useState<ChildEntry[]>([
    { first_name: "", grade: "", age: "", gender: "" },
  ]);

  const handleTurnstile = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await submitIntakeForm({
      geography_slug: geographySlug,
      parent_first: formState.parent_first,
      parent_last: formState.parent_last,
      parent_email: formState.parent_email,
      parent_phone: formState.parent_phone,
      spouse_name: formState.spouse_name,
      source: formState.source,
      children: children.map((c) => ({
        first_name: c.first_name,
        grade: c.grade || undefined,
        age: c.age ? parseInt(c.age) : undefined,
        gender: c.gender || undefined,
      })),
      consent: formState.consent as true,
      turnstile_token: turnstileToken,
    });

    setSubmitting(false);

    if (result.success) {
      router.push(`/${geographySlug}/confirmation`);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-sm text-sm text-danger">
          {error}
        </div>
      )}

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
          How did you hear about Alpha School?
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
        </select>
      </div>

      <ChildFields entries={children} onChange={setChildren} />

      <div className="border-t border-line pt-6">
        <p className="text-xs text-ink-4 mb-3">
          By submitting this form, you consent to Alpha School collecting and
          processing the information provided for enrollment inquiry purposes.
          Your data will be accessible to the local Alpha School champion and
          Alpha HQ. You can request deletion of your data at any time by
          contacting{" "}
          <a href="mailto:privacy@alphaschool.com" className="text-alpha-blue">
            privacy@alphaschool.com
          </a>
          .
        </p>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formState.consent}
            onChange={(e) => updateField("consent", e.target.checked)}
            required
            className="mt-1"
          />
          <span className="text-sm text-ink">
            I agree to the{" "}
            <a href="/privacy" className="text-alpha-blue hover:underline">
              privacy policy
            </a>{" "}
            and consent to data processing. *
          </span>
        </label>
      </div>

      <TurnstileWidget onVerify={handleTurnstile} />

      <button
        type="submit"
        disabled={submitting || !turnstileToken}
        className="w-full py-3 px-6 bg-alpha-blue text-white font-semibold rounded-sm hover:bg-alpha-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit Interest"}
      </button>
    </form>
  );
}
