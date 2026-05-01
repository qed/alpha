-- Add geography-select and geography-create audit actions
-- for self-service geography selection feature

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;

ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check CHECK (action IN (
  'drill-down', 'status-change', 'prospect-create', 'prospect-delete',
  'note-add', 'champion-create', 'champion-deactivate', 'champion-reassign',
  'geography-select', 'geography-create'
));
