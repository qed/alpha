export function FormScreenshotSection() {
  return (
    <section className="wp-form-section">
      <div className="wp-form-inner">
        <div>
          <h2 className="wp-form-heading">Express Your Interest</h2>
          <p className="wp-form-description">
            Fill out the form to learn more about Alpha and stay updated on
            enrollment, events, and community news. We will be in touch shortly
            after you submit.
          </p>
        </div>
        <div className="wp-form-placeholder">
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
      </div>
    </section>
  );
}
