-- Create footer_stats RPC function for fetching footer statistics
CREATE OR REPLACE FUNCTION footer_stats()
RETURNS TABLE (
  cases_count BIGINT,
  plaintiffs_count BIGINT,
  votes_cast_count BIGINT
) AS $$
SELECT
  COUNT(DISTINCT c.id) as cases_count,
  COUNT(DISTINCT c.plaintiff_id) as plaintiffs_count,
  COALESCE(SUM(vr.total_votes), 0)::BIGINT as votes_cast_count
FROM cases c
LEFT JOIN verdict_results vr ON c.id = vr.case_id
WHERE c.status IN ('judgment', 'investigation', 'pending_convergence', 'verdict_guilty', 'verdict_innocent');
$$ LANGUAGE sql STABLE;
