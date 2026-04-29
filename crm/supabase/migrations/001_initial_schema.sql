-- Alpha School Enrollment CRM — Initial Schema
-- All tables, indexes, constraints

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Geographies: 53 locations (23 existing + 30 pre-launch)
CREATE TABLE geographies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  region          text,
  country         text NOT NULL CHECK (country IN ('US', 'CA')),
  status          text NOT NULL DEFAULT 'pre-launch' CHECK (status IN ('pre-launch', 'existing-campus', 'active-campus')),
  enrollment_threshold int NOT NULL DEFAULT 25,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Profiles: synced from Clerk via webhook
CREATE TABLE profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   text UNIQUE NOT NULL,
  email           text NOT NULL,
  full_name       text NOT NULL,
  role            text NOT NULL CHECK (role IN ('admin', 'champion')),
  geography_id    uuid REFERENCES geographies(id),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- One active champion per geography
CREATE UNIQUE INDEX idx_one_active_champion_per_geography
  ON profiles (geography_id)
  WHERE is_active = true AND role = 'champion';

-- Prospects: one record per family per geography
CREATE TABLE prospects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geography_id    uuid NOT NULL REFERENCES geographies(id),
  parent_first    text NOT NULL,
  parent_last     text NOT NULL,
  parent_email    text NOT NULL,
  parent_phone    text,
  spouse_name     text,
  source          text,
  status          text NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'shadow-day', 'committed', 'enrolled', 'lost')),
  follow_up_date  date,
  first_responded_at timestamptz,
  consent_given   boolean NOT NULL DEFAULT false,
  consent_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (geography_id, parent_email)
);

CREATE INDEX idx_prospects_geography ON prospects(geography_id);
CREATE INDEX idx_prospects_status ON prospects(geography_id, status);
CREATE INDEX idx_prospects_follow_up ON prospects(geography_id, follow_up_date) WHERE follow_up_date IS NOT NULL;

-- Children: variable number per prospect, geography_id denormalized for RLS
CREATE TABLE children (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id     uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  geography_id    uuid NOT NULL REFERENCES geographies(id),
  first_name      text NOT NULL,
  grade           text,
  age             int CHECK (age BETWEEN 2 AND 19),
  gender          text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_children_prospect ON children(prospect_id);
CREATE INDEX idx_children_geography ON children(geography_id);

-- Notes: timestamped interaction log, geography_id denormalized for RLS
CREATE TABLE notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id     uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  geography_id    uuid NOT NULL REFERENCES geographies(id),
  author_id       uuid NOT NULL REFERENCES profiles(id),
  body            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_prospect ON notes(prospect_id);

-- Status history: tracks all pipeline transitions, geography_id denormalized for RLS
CREATE TABLE status_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id     uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  geography_id    uuid NOT NULL REFERENCES geographies(id),
  old_status      text NOT NULL,
  new_status      text NOT NULL,
  changed_by      uuid NOT NULL REFERENCES profiles(id),
  changed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_prospect ON status_history(prospect_id);

-- Audit log: comprehensive write logging for PII compliance
CREATE TABLE audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        uuid NOT NULL REFERENCES profiles(id),
  action          text NOT NULL CHECK (action IN (
    'drill-down', 'status-change', 'prospect-create', 'prospect-delete',
    'note-add', 'champion-create', 'champion-deactivate', 'champion-reassign'
  )),
  geography_id    uuid REFERENCES geographies(id),
  prospect_id     uuid,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_geography ON audit_log(geography_id);
CREATE INDEX idx_audit_log_created ON audit_log(geography_id, created_at DESC);

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_geographies_updated_at BEFORE UPDATE ON geographies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_prospects_updated_at BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
