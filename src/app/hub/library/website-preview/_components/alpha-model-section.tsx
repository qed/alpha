const FEATURES = [
  {
    icon: "\u{1F916}",
    title: "AI-Powered Personalized Learning",
    description:
      "Students use cutting-edge AI tools to master core academics at their own pace — completing in 2 hours what traditional schools take all day to cover.",
  },
  {
    icon: "\u{1F3AF}",
    title: "Entrepreneurship & Life Skills",
    description:
      "From pitching business ideas to managing money, students develop real-world capabilities most adults never learn in school.",
  },
  {
    icon: "\u{1F3C3}",
    title: "Physical & Mental Wellness",
    description:
      "Daily fitness, mindfulness, and emotional intelligence training are baked into the schedule — not an afterthought.",
  },
  {
    icon: "\u{1F30D}",
    title: "Community & Connection",
    description:
      "Small cohorts, mentors, and a culture of belonging — students thrive when they feel genuinely seen and supported.",
  },
];

export function AlphaModelSection() {
  return (
    <section className="wp-model">
      <div className="wp-model-inner">
        <div className="wp-model-eyebrow">The Alpha Model</div>
        <h2 className="wp-model-heading">
          A completely different approach to education
        </h2>
        <p className="wp-model-subtitle">
          Alpha replaces the outdated &ldquo;sit and absorb&rdquo; model with
          something radically more effective &mdash; personalized AI-powered
          learning combined with real-world skill development.
        </p>
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
