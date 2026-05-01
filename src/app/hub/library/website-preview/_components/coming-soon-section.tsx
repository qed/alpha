const SAT_SCORES = [
  { label: "Overall School Average", score: "1410" },
  { label: "Class of 2025 (Seniors)", score: "1530" },
  { label: "Class of 2026 (Juniors)", score: "1420" },
  { label: "Class of 2027 (Sophomores)", score: "1400" },
  { label: "Class of 2028 (Freshmen)", score: "1350" },
];

export function ComingSoonSection() {
  return (
    <section className="wp-coming-soon">
      <div className="wp-coming-soon-inner">
        <div>
          <div className="wp-coming-soon-eyebrow">Coming Soon</div>
          <h2 className="wp-coming-soon-heading">Alpha High School</h2>
          <p className="wp-coming-soon-text">
            Our K&ndash;8 campus is just the beginning. We&rsquo;re planning to
            open <strong>Alpha High School</strong> in{" "}
            <strong>Fall 2027</strong> &mdash; extending the same
            transformative Alpha model through 12th grade.
          </p>
          <p className="wp-coming-soon-text">
            Alpha High School graduates have gone on to selective universities,
            launched businesses, and entered the workforce with the skills,
            confidence, and self-knowledge that most adults spend years trying to
            develop. More details on our high school program will be shared with
            enrolled K&ndash;8 families first.
          </p>
        </div>
        <div className="wp-sat-container">
          <div className="wp-sat-header">
            SAT Scores &mdash; December 2024
          </div>
          <table className="wp-sat-table">
            <tbody>
              {SAT_SCORES.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className="wp-sat-score">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="wp-sat-footer">
            <span className="wp-sat-badge">94th Percentile Nationally</span>
            <span className="wp-sat-sub-badge">
              National avg: 1024 &middot; vs. 978 TX avg
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
