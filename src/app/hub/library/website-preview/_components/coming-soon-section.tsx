const SAT_SCORES = [
  { label: "Overall", score: "1410" },
  { label: "Class of 2025", score: "1530" },
  { label: "Class of 2026", score: "1420" },
  { label: "Class of 2027", score: "1400" },
  { label: "Class of 2028", score: "1350" },
];

export function ComingSoonSection() {
  return (
    <section className="wp-coming-soon">
      <div className="wp-coming-soon-inner">
        <div>
          <div className="wp-eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>
            Coming Soon
          </div>
          <h2 className="wp-coming-soon-heading">Alpha High School</h2>
          <p className="wp-coming-soon-text">
            Opening Fall 2027. The same revolutionary model, extended through
            high school. Preparing students not just for college, but for life.
          </p>
        </div>
        <div>
          <h3
            className="wp-coming-soon-heading"
            style={{ fontSize: "22px", marginBottom: "20px" }}
          >
            SAT Scores (Dec 2024)
          </h3>
          <table className="wp-sat-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {SAT_SCORES.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="wp-sat-badge">94th Percentile Nationally</div>
        </div>
      </div>
    </section>
  );
}
