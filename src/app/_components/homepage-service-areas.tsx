const CITIES = [
  "Oakville",
  "Mississauga",
  "The City of Toronto",
  "Thornhill",
  "Vaughan",
  "Markham",
  "Richmond Hill",
  "Newmarket",
];

export function HomepageServiceAreas() {
  return (
    <section className="wp-service-areas">
      <div className="wp-service-areas-heading">
        Serving Families in the Greater Toronto Area
      </div>
      <div className="wp-service-areas-list">{CITIES.join(" · ")}</div>
    </section>
  );
}
