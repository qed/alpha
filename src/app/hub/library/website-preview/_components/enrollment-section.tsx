const ENROLLMENT_CARDS = [
  { label: "Grades Served", value: "K-8" },
  { label: "School Hours", value: "8:45 AM - 3:30 PM" },
  {
    label: "Tuition",
    value: "Details shared with committed local families first",
  },
  { label: "Opening", value: "Fall 2026" },
];

export function EnrollmentSection() {
  return (
    <section className="wp-enrollment">
      <div className="wp-enrollment-inner">
        <h2 className="wp-enrollment-heading">Enrollment Info</h2>
        <div className="wp-enrollment-grid">
          {ENROLLMENT_CARDS.map((card) => (
            <div key={card.label} className="wp-enrollment-card">
              <div className="wp-enrollment-card-label">{card.label}</div>
              <div className="wp-enrollment-card-value">{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
