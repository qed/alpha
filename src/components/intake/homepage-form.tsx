"use client";

import { useState, useCallback } from "react";
import { TurnstileWidget } from "./turnstile-widget";
import { submitIntakeForm } from "@/lib/actions/intake";

const GRADE_OPTIONS = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
];

interface ChildEntry {
  first_name: string;
  grade: string;
}

export function HomepageForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [formState, setFormState] = useState({
    parent_first: "",
    parent_last: "",
    parent_email: "",
    parent_phone: "",
    postal_code: "",
    consent: false,
  });

  const [children, setChildren] = useState<ChildEntry[]>([
    { first_name: "", grade: "" },
  ]);

  const handleTurnstile = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formState.postal_code.trim()) {
      setError("Postal code is required.");
      return;
    }

    for (let i = 0; i < children.length; i++) {
      if (!children[i].first_name.trim()) {
        setError(`Child ${i + 1} name is required.`);
        return;
      }
      if (!children[i].grade) {
        setError(`Child ${i + 1} grade is required.`);
        return;
      }
    }

    setSubmitting(true);

    const result = await submitIntakeForm({
      geography_slug: "toronto",
      parent_first: formState.parent_first,
      parent_last: formState.parent_last,
      parent_email: formState.parent_email,
      parent_phone: formState.parent_phone,
      spouse_name: "",
      source: "website",
      postal_code: formState.postal_code,
      children: children.map((c) => ({
        first_name: c.first_name,
        grade: c.grade,
      })),
      consent: formState.consent as true,
      turnstile_token: turnstileToken,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateChild = (index: number, field: keyof ChildEntry, value: string) => {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addChild = () => {
    if (children.length < 15) {
      setChildren((prev) => [...prev, { first_name: "", grade: "" }]);
    }
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (success) {
    return (
      <div className="wp-events-card">
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="wp-events-heading">Thank you!</h3>
          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "8px", fontSize: "14px" }}>
            Your interest has been received. A local Alpha Toronto champion will reach out soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-events-card">
      <h3 className="wp-events-heading">Express Your Interest</h3>
      <form onSubmit={handleSubmit} className="wp-homepage-form">
        {error && (
          <div style={{ padding: "8px 12px", background: "rgba(220,38,38,0.15)", borderRadius: "6px", fontSize: "13px", color: "#fca5a5", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <div className="wp-form-row">
          <div className="wp-form-field">
            <label className="wp-form-label">First name *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={formState.parent_first}
              onChange={(e) => updateField("parent_first", e.target.value)}
              className="wp-form-input"
            />
          </div>
          <div className="wp-form-field">
            <label className="wp-form-label">Last name *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={formState.parent_last}
              onChange={(e) => updateField("parent_last", e.target.value)}
              className="wp-form-input"
            />
          </div>
        </div>

        <div className="wp-form-field">
          <label className="wp-form-label">Email address *</label>
          <input
            type="email"
            required
            maxLength={254}
            value={formState.parent_email}
            onChange={(e) => updateField("parent_email", e.target.value)}
            className="wp-form-input"
          />
        </div>

        <div className="wp-form-row">
          <div className="wp-form-field">
            <label className="wp-form-label">Mobile phone</label>
            <input
              type="tel"
              maxLength={20}
              value={formState.parent_phone}
              onChange={(e) => updateField("parent_phone", e.target.value)}
              className="wp-form-input"
            />
          </div>
          <div className="wp-form-field">
            <label className="wp-form-label">Postal code *</label>
            <input
              type="text"
              required
              maxLength={10}
              value={formState.postal_code}
              onChange={(e) => updateField("postal_code", e.target.value)}
              className="wp-form-input"
            />
          </div>
        </div>

        {children.map((child, index) => (
          <div key={index} className="wp-form-child-group">
            <div className="wp-form-row">
              <div className="wp-form-field">
                <label className="wp-form-label">
                  Child {index + 1} name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={child.first_name}
                  onChange={(e) => updateChild(index, "first_name", e.target.value)}
                  className="wp-form-input"
                />
              </div>
              <div className="wp-form-field">
                <label className="wp-form-label">
                  Child {index + 1} grade *
                </label>
                <select
                  required
                  value={child.grade}
                  onChange={(e) => updateChild(index, "grade", e.target.value)}
                  className="wp-form-input"
                >
                  <option value="">Select grade</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g === "K" ? "Kindergarten" : `Grade ${g}`}</option>
                  ))}
                </select>
              </div>
            </div>
            {children.length > 1 && (
              <button
                type="button"
                onClick={() => removeChild(index)}
                className="wp-form-remove-child"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {children.length < 15 && (
          <button type="button" onClick={addChild} className="wp-form-add-child">
            + Add another child
          </button>
        )}

        <div className="wp-form-consent">
          <label className="wp-form-consent-label">
            <input
              type="checkbox"
              required
              checked={formState.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
            />
            <span>
              We are committed to protecting and respecting your privacy. By submitting this form, you consent to Alpha Toronto contacting you with communications about Alpha School.
            </span>
          </label>
        </div>

        <TurnstileWidget onVerify={handleTurnstile} />

        <button
          type="submit"
          disabled={submitting || !turnstileToken}
          className="wp-form-submit"
        >
          {submitting ? "Submitting..." : "Express Interest"}
        </button>
      </form>
    </div>
  );
}
