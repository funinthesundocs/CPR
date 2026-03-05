-- Recreate update_profile_progress function to ensure is_verified is included
-- Then recalculate all participation scores

DROP FUNCTION IF EXISTS update_profile_progress(UUID);

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

  -- Rule 6: Email verified = +30 pts
  IF (SELECT is_verified FROM user_profiles WHERE id = user_id) THEN
    score := score + 30;
  END IF;

  UPDATE user_profiles
  SET profile_progress = LEAST(score, 100)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all participation scores
DO $$
DECLARE
  user_id UUID;
BEGIN
  FOR user_id IN SELECT id FROM user_profiles LOOP
    PERFORM update_profile_progress(user_id);
  END LOOP;
END $$;
