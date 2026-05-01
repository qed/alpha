export function Footer() {
  return (
    <footer className="wp-footer">
      <div className="wp-footer-inner">
        <div className="wp-footer-brand">
          <img
            src="/artifacts/Alpha Logo.png"
            alt="Alpha"
            className="wp-footer-logo"
          />
          <span className="wp-footer-name">Local City</span>
        </div>
        <div className="wp-footer-url">alphalocalcity.org</div>
        <div className="wp-footer-copyright">
          &copy; {new Date().getFullYear()} Alpha Local City. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
