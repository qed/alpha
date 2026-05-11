import Image from "next/image";

export function HomepageHero() {
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
        <div className="wp-hero-cta-card">
          <Image
            src="/artifacts/images/join_alpha.png"
            alt="Where limitless families belong — 100+ families and growing"
            width={600}
            height={400}
            className="wp-hero-cta-image"
            priority
          />
          <a
            href="https://community.alpha.school/?ref=UFB2FW8LX"
            target="_blank"
            rel="noopener noreferrer"
            className="wp-hero-cta-button"
          >
            Join Alpha
          </a>
        </div>
      </div>
    </section>
  );
}
