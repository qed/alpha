const FEATURES = [
  {
    icon: "\u{1F4BB}",
    title: "AI-Powered Personalized Learning",
    description:
      "Students master core academics at their own pace with adaptive AI tutoring, achieving 90% concept mastery before advancing.",
  },
  {
    icon: "\u{1F680}",
    title: "Entrepreneurship & Life Skills",
    description:
      "Afternoons are devoted to financial literacy, public speaking, coding, cooking, and real-world problem solving.",
  },
  {
    icon: "\u{1F9D8}",
    title: "Physical & Mental Wellness",
    description:
      "Daily fitness, mindfulness, and emotional intelligence are built into the schedule — not an afterthought.",
  },
  {
    icon: "\u{1F91D}",
    title: "Community & Connection",
    description:
      "Small cohorts, dedicated mentors, and a culture of belonging where every student is truly known.",
  },
];

export function AlphaModelSection() {
  return (
    <section className="wp-model">
      <div className="wp-model-inner">
        <h2 className="wp-model-heading">The Alpha Model</h2>
        <div className="wp-model-grid">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="wp-model-card">
              <div className="wp-model-icon">{feature.icon}</div>
              <h3 className="wp-model-card-title">{feature.title}</h3>
              <p className="wp-model-card-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
