export function CtaSection() {
  return (
    <section className="wp-cta">
      <h2 className="wp-cta-heading">
        Ready to be part of something different?
      </h2>
      <a
        href="https://community.alpha.school"
        target="_blank"
        rel="noopener noreferrer"
        className="wp-cta-button"
      >
        Join the Discussion
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
    </section>
  );
}
