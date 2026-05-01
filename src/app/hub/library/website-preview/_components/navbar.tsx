export function Navbar() {
  return (
    <nav className="wp-nav">
      <div className="wp-nav-inner">
        <div className="wp-nav-brand">
          <div className="wp-nav-logo">A</div>
          <span className="wp-nav-text">Alpha Local City</span>
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
