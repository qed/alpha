export function Footer() {
  return (
    <footer className="wp-footer">
      <div className="wp-footer-logo">alpha</div>
      <div className="wp-footer-name">Alpha Local City</div>
      <div className="wp-footer-url">alphalocalcity.org</div>
      <div className="wp-footer-copyright">
        &copy; {new Date().getFullYear()} Alpha Local City. All rights reserved.
      </div>
    </footer>
  );
}
