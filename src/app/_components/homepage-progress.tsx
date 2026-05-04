const MILESTONES = [
  { label: "Community Portal open", completed: true },
  { label: "Accepting Commitments", completed: true },
  { label: "50 Commitments", completed: false },
  { label: "Determining Location", completed: false },
];

export function HomepageProgress() {
  return (
    <section className="wp-progress">
      <div className="wp-progress-header">
        <div className="wp-progress-eyebrow">Where We Are</div>
        <h2 className="wp-progress-heading">Our Progress</h2>
      </div>
      <div className="wp-progress-inner">
        <div className="wp-progress-line">
          <div className="wp-progress-line-fill" style={{ width: "40%" }} />
        </div>
        {MILESTONES.map((milestone) => (
          <div key={milestone.label} className="wp-progress-step">
            {milestone.completed ? (
              <div className="wp-progress-check">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <div className="wp-progress-current">
                <div className="wp-progress-dot" />
              </div>
            )}
            <span className="wp-progress-label">{milestone.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
