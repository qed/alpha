import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-alpha-blue hover:underline no-underline">
        ← Back
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink mt-4 mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-sm text-ink space-y-6">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
            What We Collect
          </h2>
          <p className="text-ink-3 leading-relaxed">
            When you submit an enrollment inquiry, we collect: parent/guardian
            name, email address, phone number (optional), postal code,
            spouse/partner name (optional), and child information (first name,
            age, grade, gender). We also collect your referral source and a
            timestamp of your submission.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
            How We Use Your Data
          </h2>
          <p className="text-ink-3 leading-relaxed">
            Your information is used solely for enrollment inquiry processing.
            This includes contacting you about enrollment opportunities,
            scheduling shadow days, and tracking your family&apos;s interest
            through our enrollment pipeline.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
            Who Has Access
          </h2>
          <p className="text-ink-3 leading-relaxed">
            Your data is accessible to the local Alpha School champion assigned
            to your geography and to Alpha School headquarters (Alpha HQ)
            administrators. We do not sell, share, or provide your data to third
            parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
            Data Retention
          </h2>
          <p className="text-ink-3 leading-relaxed">
            We retain your data while your enrollment inquiry is active. Prospect
            records with no activity for 24 months are candidates for archival.
            You may request deletion of your data at any time.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
            Bot Protection
          </h2>
          <p className="text-ink-3 leading-relaxed">
            Our enrollment form uses Cloudflare Turnstile to protect against
            automated submissions. This service may collect limited technical
            data as described in{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              className="text-alpha-blue hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cloudflare&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
            Your Rights
          </h2>
          <p className="text-ink-3 leading-relaxed">
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us at{" "}
            <a
              href="mailto:privacy@alphaschool.com"
              className="text-alpha-blue hover:underline"
            >
              privacy@alphaschool.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-3">
            Contact
          </h2>
          <p className="text-ink-3 leading-relaxed">
            For questions about this privacy policy or your data, contact us at{" "}
            <a
              href="mailto:privacy@alphaschool.com"
              className="text-alpha-blue hover:underline"
            >
              privacy@alphaschool.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
