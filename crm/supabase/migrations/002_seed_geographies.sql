-- Seed 55 geographies — all pre-launch initially
-- Slugs are URL-safe lowercase identifiers for intake form URLs

INSERT INTO geographies (slug, name, region, country, status) VALUES
  -- Texas
  ('austin', 'Austin', 'Texas', 'US', 'pre-launch'),
  ('alpha-high-austin', 'Alpha High Austin', 'Texas', 'US', 'pre-launch'),
  ('lake-travis', 'Lake Travis', 'Texas', 'US', 'pre-launch'),
  ('plano', 'Plano', 'Texas', 'US', 'pre-launch'),
  ('carrollton', 'Carrollton', 'Texas', 'US', 'pre-launch'),
  ('southlake', 'Southlake', 'Texas', 'US', 'pre-launch'),
  ('fort-worth', 'Fort Worth', 'Texas', 'US', 'pre-launch'),
  ('houston', 'Houston', 'Texas', 'US', 'pre-launch'),
  ('the-woodlands', 'The Woodlands', 'Texas', 'US', 'pre-launch'),
  ('brownsville', 'Brownsville', 'Texas', 'US', 'pre-launch'),
  ('highland-park', 'Highland Park', 'Texas', 'US', 'pre-launch'),

  -- Florida
  ('miami', 'Miami', 'Florida', 'US', 'pre-launch'),
  ('miami-beach', 'Miami Beach', 'Florida', 'US', 'pre-launch'),
  ('key-biscayne', 'Key Biscayne', 'Florida', 'US', 'pre-launch'),
  ('tampa', 'Tampa', 'Florida', 'US', 'pre-launch'),
  ('palm-beach', 'Palm Beach', 'Florida', 'US', 'pre-launch'),
  ('boca-raton', 'Boca Raton', 'Florida', 'US', 'pre-launch'),

  -- Southeast
  ('atlanta', 'Atlanta', 'Southeast', 'US', 'pre-launch'),
  ('nashville', 'Nashville', 'Southeast', 'US', 'pre-launch'),
  ('charlotte', 'Charlotte', 'Southeast', 'US', 'pre-launch'),
  ('raleigh', 'Raleigh', 'Southeast', 'US', 'pre-launch'),

  -- Northeast
  ('new-york', 'New York', 'Northeast', 'US', 'pre-launch'),
  ('boston', 'Boston', 'Northeast', 'US', 'pre-launch'),
  ('boston-suburbs', 'Boston Suburbs', 'Northeast', 'US', 'pre-launch'),
  ('greenwich', 'Greenwich', 'Northeast', 'US', 'pre-launch'),
  ('bethesda', 'Bethesda', 'Northeast', 'US', 'pre-launch'),
  ('chantilly', 'Chantilly', 'Northeast', 'US', 'pre-launch'),
  ('pioneer-valley', 'Pioneer Valley', 'Northeast', 'US', 'pre-launch'),

  -- Midwest
  ('chicago', 'Chicago', 'Midwest', 'US', 'pre-launch'),
  ('kansas-city', 'Kansas City', 'Midwest', 'US', 'pre-launch'),
  ('oklahoma-city', 'Oklahoma City', 'Midwest', 'US', 'pre-launch'),
  ('tulsa', 'Tulsa', 'Midwest', 'US', 'pre-launch'),

  -- West
  ('denver', 'Denver', 'West', 'US', 'pre-launch'),
  ('scottsdale', 'Scottsdale', 'West', 'US', 'pre-launch'),
  ('las-vegas', 'Las Vegas', 'West', 'US', 'pre-launch'),
  ('jackson-hole', 'Jackson Hole', 'West', 'US', 'pre-launch'),
  ('park-city', 'Park City', 'West', 'US', 'pre-launch'),
  ('kirkland', 'Kirkland', 'West', 'US', 'pre-launch'),

  -- California
  ('orange-county', 'Orange County', 'California', 'US', 'pre-launch'),
  ('la-jolla', 'La Jolla', 'California', 'US', 'pre-launch'),
  ('beverly-hills', 'Beverly Hills', 'California', 'US', 'pre-launch'),
  ('santa-monica', 'Santa Monica', 'California', 'US', 'pre-launch'),
  ('malibu', 'Malibu', 'California', 'US', 'pre-launch'),
  ('santa-barbara', 'Santa Barbara', 'California', 'US', 'pre-launch'),
  ('east-bay', 'East Bay', 'California', 'US', 'pre-launch'),
  ('palo-alto', 'Palo Alto', 'California', 'US', 'pre-launch'),
  ('san-francisco', 'San Francisco', 'California', 'US', 'pre-launch'),
  ('sausalito', 'Sausalito', 'California', 'US', 'pre-launch'),
  ('south-bay', 'South Bay', 'California', 'US', 'pre-launch'),

  -- Puerto Rico
  ('dorado', 'Dorado', 'Puerto Rico', 'US', 'pre-launch'),
  ('san-juan', 'San Juan', 'Puerto Rico', 'US', 'pre-launch'),

  -- Canada
  ('toronto', 'Toronto', 'Ontario', 'CA', 'pre-launch'),
  ('north-toronto', 'North Toronto', 'Ontario', 'CA', 'pre-launch'),
  ('west-toronto', 'West Toronto', 'Ontario', 'CA', 'pre-launch'),
  ('burlington', 'Burlington', 'Ontario', 'CA', 'pre-launch');
