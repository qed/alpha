-- Audit log: ensure immutability (no UPDATE/DELETE)
-- RLS already covers this, but belt-and-suspenders with a trigger

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log entries are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Auto-update updated_at on prospects when modified
CREATE OR REPLACE FUNCTION update_prospect_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospect_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_prospect_updated_at();
