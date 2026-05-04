export function HomepageFooter() {
  return (
    <footer className="wp-footer">
      <div className="wp-footer-inner">
        <div className="wp-footer-brand">
          <img
            src="/artifacts/Alpha Logo.png"
            alt="Alpha"
            className="wp-footer-logo"
          />
          <span className="wp-footer-name">Alpha Toronto Parents Hub</span>
        </div>
        <div className="wp-footer-url">alphatoronto.org</div>
        <div className="wp-footer-copyright">
          &copy; {new Date().getFullYear()} Alpha Toronto. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
