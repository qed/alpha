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
            entrepreneurship, wellness, real-world experiences, and becoming
            the best version of themselves.
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
          <FormCard />
        </div>
      </div>
    </section>
  );
}

function FormCard() {
  return (
    <div className="wp-events-card">
      <h3 className="wp-events-heading">Express Your Interest</h3>
      <div className="wp-form-placeholder-fields">
        <div className="wp-form-placeholder-row">
          <div className="wp-form-placeholder-field">
            <span className="wp-form-placeholder-label">First name</span>
            <div className="wp-form-placeholder-input" />
          </div>
          <div className="wp-form-placeholder-field">
            <span className="wp-form-placeholder-label">Last name</span>
            <div className="wp-form-placeholder-input" />
          </div>
        </div>
        <div className="wp-form-placeholder-field">
          <span className="wp-form-placeholder-label">Email</span>
          <div className="wp-form-placeholder-input" />
        </div>
        <div className="wp-form-placeholder-field">
          <span className="wp-form-placeholder-label">Phone number</span>
          <div className="wp-form-placeholder-input" />
        </div>
        <div className="wp-form-placeholder-btn">Submit</div>
      </div>
      <p className="wp-form-placeholder-note">
        This is a non-interactive preview of the enrollment form.
      </p>
    </div>
  );
}
