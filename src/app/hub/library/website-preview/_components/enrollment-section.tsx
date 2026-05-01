const ENROLLMENT_CARDS = [
  {
    label: "Grades Served",
    value: "Kindergarten – 8th Grade",
    description:
      "Alpha Local City opens K–8. A high school campus is planned for Fall 2027 (see below).",
  },
  {
    label: "School Hours",
    value: "8:45 AM – 3:30 PM",
    description: "Full school days Monday through Friday.",
  },
  {
    label: "Tuition",
    value: "Tuition",
    description:
      "Tuition details will be shared with committed families first. We’re committed to making Alpha accessible to local families.",
  },
  {
    label: "Opening",
    value: "Fall 2026",
    description:
      "We’re targeting a Fall 2026 opening for K–8. Early commitments secure your family’s priority in the enrollment process.",
  },
];

export function EnrollmentSection() {
  return (
    <section className="wp-enrollment">
      <div className="wp-enrollment-inner">
        <div className="wp-enrollment-eyebrow">Enrollment Info</div>
        <h2 className="wp-enrollment-heading">
          Practical details for families
        </h2>
        <p className="wp-enrollment-subtitle">
          We know you have logistical questions. Here&rsquo;s what we know so
          far &mdash; more details coming as we approach opening.
        </p>
        <div className="wp-enrollment-grid">
          {ENROLLMENT_CARDS.map((card) => (
            <div key={card.label} className="wp-enrollment-card">
              <div className="wp-enrollment-card-label">{card.label}</div>
              <h4 className="wp-enrollment-card-value">{card.value}</h4>
              <p className="wp-enrollment-card-desc">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
