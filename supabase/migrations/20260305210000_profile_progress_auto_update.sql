-- Auto-update profile_progress whenever tracking columns change
-- This ensures the profile_progress column stays in sync with calculated value

-- 1. Helper function to recalculate and update profile_progress for a user
CREATE OR REPLACE FUNCTION update_profile_progress(user_id UUID)
RETURNS VOID AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Rule 1: Profile 100% complete = 50 pts
  IF (SELECT profile_completion = 100 FROM user_profiles WHERE id = user_id) THEN
    score := score + 50;
  END IF;

  -- Rule 2: Joined case = +20 pts
  IF (SELECT has_joined_case FROM user_profiles WHERE id = user_id) THEN
    score := score + 20;
  END IF;

  -- Rule 3: Login within 7 days = +10 pts
  IF (SELECT last_login_at IS NOT NULL AND (NOW() - last_login_at) < INTERVAL '7 days' FROM user_profiles WHERE id = user_id) THEN
    score := score + 10;
  END IF;

  -- Rule 4: Vote within 7 days = +10 pts
  IF (SELECT last_vote_at IS NOT NULL AND (NOW() - last_vote_at) < INTERVAL '7 days' FROM user_profiles WHERE id = user_id) THEN
    score := score + 10;
  END IF;

  -- Rule 5: First vote correct = +10 pts
  IF (SELECT first_vote_correct FROM user_profiles WHERE id = user_id) THEN
    score := score + 10;
  END IF;

  -- Update profile_progress column with calculated score (capped at 100)
  UPDATE user_profiles
  SET profile_progress = LEAST(score, 100)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger on user_profiles UPDATE to recalculate when any tracking column changes
CREATE OR REPLACE FUNCTION on_profile_tracking_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if one of the tracking columns changed
  IF (OLD.profile_completion IS DISTINCT FROM NEW.profile_completion OR
      OLD.has_joined_case IS DISTINCT FROM NEW.has_joined_case OR
      OLD.last_login_at IS DISTINCT FROM NEW.last_login_at OR
      OLD.last_vote_at IS DISTINCT FROM NEW.last_vote_at OR
      OLD.first_vote_correct IS DISTINCT FROM NEW.first_vote_correct OR
      OLD.is_verified IS DISTINCT FROM NEW.is_verified) THEN
    PERFORM update_profile_progress(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profile_tracking_update
AFTER UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION on_profile_tracking_change();

-- 3. Recalculate all existing user profiles to sync column
UPDATE user_profiles SET profile_progress = 0 WHERE profile_progress IS NULL;

-- Run update_profile_progress for all users to recalculate
DO $$
DECLARE
  user_id UUID;
BEGIN
  FOR user_id IN SELECT id FROM user_profiles LOOP
    PERFORM update_profile_progress(user_id);
  END LOOP;
END $$;
