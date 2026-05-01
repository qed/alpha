const CITIES = [
  "Center City",
  "City East",
  "City West",
  "City North",
  "City South",
  "City Suburbs",
];

export function ServiceAreasSection() {
  return (
    <section className="wp-service-areas">
      <div className="wp-service-areas-heading">
        Serving Families in your local cities
      </div>
      <div className="wp-service-areas-list">{CITIES.join(" · ")}</div>
    </section>
  );
}
