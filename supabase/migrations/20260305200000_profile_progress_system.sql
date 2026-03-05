-- Profile Progress Scoring System
-- Replaces trust_score with profile_progress (0-100)
--
-- Scoring rules:
-- - Profile 100% complete: 50 pts
-- - Join first case (any role): +20 pts (→70%)
-- - Login within 7 days: +10 pts (dropped after 7 days no login)
-- - Vote within 7 days: +10 pts (dropped after 7 days no vote)
-- - First vote matches verdict: +10 pts (dropped if wrong, regained if correct)
--
-- Time windows use UTC: (NOW() - timestamp) < INTERVAL '7 days'
-- This means: day 0-6 inclusive = earn pts, day 7+ = lose pts

-- 1. Rename column trust_score to profile_progress
ALTER TABLE user_profiles RENAME COLUMN trust_score TO profile_progress;

-- 2. Add tracking columns
ALTER TABLE user_profiles ADD COLUMN (
  last_login_at TIMESTAMP DEFAULT NULL,
  last_vote_at TIMESTAMP DEFAULT NULL,
  has_joined_case BOOLEAN DEFAULT FALSE,
  first_vote_correct BOOLEAN DEFAULT NULL
);

-- 3. Create calculation function
CREATE OR REPLACE FUNCTION calculate_profile_progress(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile_complete BOOLEAN;
  has_joined BOOLEAN;
  login_valid BOOLEAN;
  vote_valid BOOLEAN;
  vote_correct BOOLEAN;
BEGIN
  -- Rule 1: Profile 100% complete = 50 pts
  SELECT profile_completion = 100 INTO profile_complete
  FROM user_profiles WHERE id = user_id;
  IF COALESCE(profile_complete, FALSE) THEN
    score := score + 50;
  END IF;

  -- Rule 2: Joined case = +20 pts
  SELECT has_joined_case INTO has_joined
  FROM user_profiles WHERE id = user_id;
  IF COALESCE(has_joined, FALSE) THEN
    score := score + 20;
  END IF;

  -- Rule 3: Login within 7 days = +10 pts
  SELECT last_login_at IS NOT NULL AND (NOW() - last_login_at) < INTERVAL '7 days'
  INTO login_valid FROM user_profiles WHERE id = user_id;
  IF COALESCE(login_valid, FALSE) THEN
    score := score + 10;
  END IF;

  -- Rule 4: Vote within 7 days = +10 pts
  SELECT last_vote_at IS NOT NULL AND (NOW() - last_vote_at) < INTERVAL '7 days'
  INTO vote_valid FROM user_profiles WHERE id = user_id;
  IF COALESCE(vote_valid, FALSE) THEN
    score := score + 10;
  END IF;

  -- Rule 5: First vote correct = +10 pts
  SELECT first_vote_correct INTO vote_correct
  FROM user_profiles WHERE id = user_id;
  IF COALESCE(vote_correct, FALSE) THEN
    score := score + 10;
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Trigger for case membership (mark user as joined)
CREATE OR REPLACE FUNCTION mark_user_joined_case()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles SET has_joined_case = TRUE WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_case_membership_insert
AFTER INSERT ON user_case_memberships
FOR EACH ROW
EXECUTE FUNCTION mark_user_joined_case();

-- 5. Trigger for vote submission (track vote timestamp and verdict correctness)
CREATE OR REPLACE FUNCTION track_vote_submission()
RETURNS TRIGGER AS $$
DECLARE
  final_verdict TEXT;
  user_vote_correct BOOLEAN;
  vote_count INTEGER;
BEGIN
  -- Track vote timestamp
  UPDATE user_profiles SET last_vote_at = NOW() WHERE id = NEW.user_id;

  -- Check if this case has a verdict
  SELECT verdict_direction INTO final_verdict
  FROM verdict_results WHERE case_id = NEW.case_id;

  IF final_verdict IS NOT NULL THEN
    -- Determine if user vote was correct (guilt_score >= 6 = guilty, < 6 = not guilty)
    user_vote_correct :=
      (NEW.guilt_score >= 6 AND final_verdict = 'guilty') OR
      (NEW.guilt_score < 6 AND final_verdict = 'not_guilty');

    -- Only update if this is their FIRST vote on this case
    SELECT COUNT(*) INTO vote_count
    FROM votes WHERE user_id = NEW.user_id AND case_id = NEW.case_id;

    IF vote_count = 1 THEN
      UPDATE user_profiles SET first_vote_correct = user_vote_correct WHERE id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_vote_submitted
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION track_vote_submission();
