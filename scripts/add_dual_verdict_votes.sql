-- Migration: Dual Verdict System — add initial_guilt_score to votes
-- Run in: Supabase Dashboard → SQL Editor
-- Purpose: Captures gut instinct on first vote (immutable) separately from
--          the mutable guilt_score that can be updated. Two verdicts at resolution.
-- NOTE: votes table uses guilt_score (not vote_score)

-- ── Add column ──────────────────────────────────────────────────────────────

ALTER TABLE votes
ADD COLUMN IF NOT EXISTS initial_guilt_score numeric(3,1);

-- ── Backfill existing rows ───────────────────────────────────────────────────

UPDATE votes
SET initial_guilt_score = guilt_score
WHERE initial_guilt_score IS NULL;

-- ── Trigger: capture initial_guilt_score on first INSERT ─────────────────────
-- Sets initial_guilt_score = guilt_score at INSERT time if not explicitly provided.

CREATE OR REPLACE FUNCTION capture_initial_guilt_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.initial_guilt_score IS NULL THEN
        NEW.initial_guilt_score := NEW.guilt_score;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_initial_guilt_score ON votes;
CREATE TRIGGER set_initial_guilt_score
    BEFORE INSERT ON votes
    FOR EACH ROW EXECUTE FUNCTION capture_initial_guilt_score();

-- ── Trigger: protect initial_guilt_score from being overwritten on UPDATE ─────
-- Once set, initial_guilt_score is immutable — the "gut instinct" is locked forever.

CREATE OR REPLACE FUNCTION protect_initial_guilt_score()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.initial_guilt_score IS NOT NULL THEN
        NEW.initial_guilt_score := OLD.initial_guilt_score;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS preserve_initial_guilt_score ON votes;
CREATE TRIGGER preserve_initial_guilt_score
    BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION protect_initial_guilt_score();

-- ── Verify ───────────────────────────────────────────────────────────────────
-- After running, confirm with:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'votes' AND column_name = 'initial_guilt_score';
