export function HeroSection() {
  return (
    <section className="wp-hero">
      <div className="wp-hero-grid">
        <div>
          <div className="wp-eyebrow">Now Accepting Commitments</div>
          <h1 className="wp-hero-headline">
            School that <em>actually prepares</em> kids for the future
          </h1>
          <p className="wp-hero-subtitle">
            Alpha is a revolutionary K-8 school where students master core
            academics in ~2 hours per day through AI-powered, personalized
            learning, then spend the rest of the day on life skills,
            entrepreneurship, wellness, and real-world experiences.
          </p>
          <div className="wp-hero-stats">
            <div className="wp-hero-stat">
              <div className="wp-hero-stat-value">2hrs</div>
              <div className="wp-hero-stat-label">daily academics</div>
            </div>
            <div className="wp-hero-stat">
              <div className="wp-hero-stat-value">2.6x</div>
              <div className="wp-hero-stat-label">learning rate</div>
            </div>
            <div className="wp-hero-stat">
              <div className="wp-hero-stat-value">K-8</div>
              <div className="wp-hero-stat-label">all grades</div>
            </div>
          </div>
        </div>
        <div>
          <EventsCard />
        </div>
      </div>
    </section>
  );
}

function EventsCard() {
  return (
    <div className="wp-events-card">
      <div className="wp-events-card-header">
        <h3 className="wp-events-heading">Upcoming Events</h3>
        <div className="wp-events-subheading">This Week</div>
      </div>
      <div className="wp-events-placeholder">
        View all in Community Portal
      </div>
    </div>
  );
}
