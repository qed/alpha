export function Navbar() {
  return (
    <nav className="wp-nav">
      <div className="wp-nav-inner">
        <div className="wp-nav-brand">
          <img
            src="/artifacts/Alpha Logo.png"
            alt="Alpha"
            className="wp-nav-logo"
          />
          <span className="wp-nav-text">Local City</span>
        </div>
        <a
          href="https://community.alpha.school"
          target="_blank"
          rel="noopener noreferrer"
          className="wp-nav-cta"
        >
          Join the Discussion
        </a>
      </div>
    </nav>
  );
}
