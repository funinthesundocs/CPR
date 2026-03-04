ALTER TABLE evidence ADD COLUMN IF NOT EXISTS timeline_event_id UUID REFERENCES timeline_events(id) ON DELETE SET NULL;
