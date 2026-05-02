-- Pipeline CRM enhancements
-- Add new columns to prospects, create library tables, extend audit_log

-- ============ PROSPECTS TABLE ALTERATIONS ============

ALTER TABLE prospects ADD COLUMN heat_score smallint NOT NULL DEFAULT 3 CHECK (heat_score BETWEEN 1 AND 5);
ALTER TABLE prospects ADD COLUMN concerns text[] NOT NULL DEFAULT '{}';
ALTER TABLE prospects ADD COLUMN engagement_signals text[] NOT NULL DEFAULT '{}';
ALTER TABLE prospects ADD COLUMN last_touch_at timestamptz;
ALTER TABLE prospects ADD COLUMN neighborhood text;

-- Backfill last_touch_at from updated_at or created_at
UPDATE prospects SET last_touch_at = COALESCE(updated_at, created_at);
ALTER TABLE prospects ALTER COLUMN last_touch_at SET NOT NULL;
ALTER TABLE prospects ALTER COLUMN last_touch_at SET DEFAULT now();

-- Make parent_email nullable for quick-add prospects
ALTER TABLE prospects ALTER COLUMN parent_email DROP NOT NULL;

-- Replace exact unique constraint with partial index (NULLs are distinct in PostgreSQL)
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_geography_id_parent_email_key;
CREATE UNIQUE INDEX idx_prospects_geo_email ON prospects (geography_id, parent_email) WHERE parent_email IS NOT NULL;

-- ============ LIBRARY ITEMS TABLE ============

CREATE TABLE library_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type                text NOT NULL CHECK (type IN ('faq', 'quote', 'talking', 'data')),
  title               text NOT NULL,
  body                text NOT NULL,
  concern             text,
  helpfulness_score   smallint NOT NULL DEFAULT 0,
  send_count          int NOT NULL DEFAULT 0,
  geography_id        uuid REFERENCES geographies(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_library_items_concern ON library_items(concern);
CREATE INDEX idx_library_items_geography ON library_items(geography_id);

CREATE TRIGGER trg_library_items_updated_at BEFORE UPDATE ON library_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ LIBRARY SENDS TABLE ============

CREATE TABLE library_sends (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_item_id     uuid NOT NULL REFERENCES library_items(id),
  prospect_id         uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  champion_id         uuid NOT NULL REFERENCES profiles(id),
  geography_id        uuid NOT NULL REFERENCES geographies(id),
  channel             text NOT NULL,
  sent_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_library_sends_prospect ON library_sends(prospect_id);
CREATE INDEX idx_library_sends_geography ON library_sends(geography_id);

-- ============ AUDIT LOG EXTENSION ============

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;

ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check CHECK (action IN (
  'drill-down', 'status-change', 'prospect-create', 'prospect-delete',
  'note-add', 'champion-create', 'champion-deactivate', 'champion-reassign',
  'geography-select', 'geography-create',
  'signal-toggle', 'concern-update', 'heat-override'
));

-- ============ RLS POLICIES ============

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_sends ENABLE ROW LEVEL SECURITY;

-- Library items: champions can read items for their geography or global items
CREATE POLICY library_items_select ON library_items
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id IS NULL
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

-- Library sends: geography-scoped read
CREATE POLICY library_sends_select ON library_sends
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY library_sends_insert ON library_sends
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

-- ============ SEED LIBRARY ITEMS ============

INSERT INTO library_items (type, title, body, concern) VALUES
  ('talking', 'Three things to say to the tuition-skeptic spouse', 'When your spouse pushes back on tuition, lead with outcomes: 1) Alpha graduates are college-ready with real-world skills, 2) The cost compares favorably to private schools when you factor in the full-day program, 3) Many families find creative ways to make it work — ask about flexible payment options.', 'tuition'),
  ('data', 'Alpha School cost vs private school comparison', 'Alpha School tuition averages 30-40% less than comparable private schools in most markets. Unlike traditional private schools, Alpha includes technology, project-based learning materials, and extended-day programming in the base tuition.', 'tuition'),
  ('faq', 'How self-paced learning works at Alpha', 'Students at Alpha work through core academics at their own pace using adaptive software. This means a 3rd grader reading at a 5th grade level can advance without waiting, while a student who needs more time gets it without falling behind. Guides monitor progress daily and intervene when a student is stuck.', 'pace'),
  ('quote', 'Parent testimonial on pace flexibility', '"My son was bored in traditional school because he was always waiting for the class. At Alpha, he moved through math two grade levels ahead in his first year. But what surprised me most was how the guides caught the areas where he needed to slow down." — Alpha parent, Year 2', 'pace'),
  ('faq', 'Alpha School accreditation status FAQ', 'Alpha School is accredited through [accreditation body]. Our accreditation covers all campuses and ensures that credits and transcripts are recognized by colleges and other schools. We maintain the same academic standards as traditional accredited institutions while using a different instructional model.', 'accreditation'),
  ('data', 'Accreditation comparison data', 'Alpha School holds the same regional accreditation as traditional private and public schools. 100% of Alpha graduates who applied to college were accepted. Transcripts are accepted by all major university systems.', 'accreditation'),
  ('data', 'Screen time breakdown at Alpha', 'A typical Alpha student spends 2-3 hours per day on screens for core academics (math, reading, writing). The remaining 4-5 hours include hands-on projects, outdoor time, Socratic discussions, physical activity, and collaborative work. Screen time is a tool, not the whole experience.', 'screen-time'),
  ('faq', 'How we balance screen and hands-on learning', 'Alpha uses technology for personalized academic instruction where it is most effective — adaptive math and reading programs that adjust to each student. The rest of the day is deliberately screen-free: Socratic seminars, hands-on STEM projects, outdoor exploration, and creative arts.', 'screen-time'),
  ('faq', 'Socialization at Alpha School', 'Alpha students socialize throughout the day — during collaborative projects, Socratic discussions, lunch, recess, and enrichment activities. Multi-age grouping means students learn to interact with peers of different ages, which research shows builds stronger social skills than single-age classrooms.', 'socialization'),
  ('quote', 'Parent testimonial on social life', '"I worried about socialization before enrolling. Within two weeks, my daughter had closer friendships than she ever had at her old school. The small class sizes and project-based work mean kids actually talk to each other instead of sitting silently in rows." — Alpha parent, Year 1', 'socialization'),
  ('faq', 'How transcripts and college readiness work', 'Alpha School produces standard transcripts with GPA, course titles, and credit hours that colleges recognize. Students also build a portfolio of real-world projects. Our college counseling begins in 9th grade. Alpha graduates consistently gain admission to competitive universities.', 'transcripts'),
  ('faq', 'Alpha School approach to values and faith', 'Alpha School is non-denominational and welcomes families of all faith backgrounds. Our character development program focuses on universal virtues — courage, integrity, curiosity, and kindness — without promoting any specific religious tradition. Families are free to pursue their own faith formation outside of school.', 'religion'),
  ('talking', 'Getting your spouse on board with Alpha', 'Start by identifying your spouse''s specific concern — is it cost, screen time, accreditation, or something else? Then address that concern directly with data. Invite them to visit a campus or attend an info session. Many skeptical spouses become advocates after seeing students in action.', 'spouse-buy-in'),
  ('talking', 'Spouse buy-in conversation starters', 'Try these conversation starters: "What do you wish was different about [child''s name]''s current school?" "If money weren''t an issue, what would the ideal school look like?" "Would you be open to visiting for 30 minutes just to see it?" Start from shared values, not from selling Alpha.', 'spouse-buy-in');
