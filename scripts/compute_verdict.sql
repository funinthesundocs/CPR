-- Compute Verdict Function
-- Aggregates votes for a case and upserts into verdict_results
-- 
-- Usage: SELECT compute_verdict('some-case-uuid');
-- Or call from admin panel's "Seal Verdict" button

CREATE OR REPLACE FUNCTION compute_verdict(p_case_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_votes INTEGER;
    v_avg_guilt NUMERIC;
    v_verdict TEXT;
    v_nominal_approved_count INTEGER;
    v_nominal_denied_count INTEGER;
    v_total_punitive NUMERIC;
    v_total_restitution NUMERIC;
    v_result JSONB;
BEGIN
    -- Count total votes
    SELECT COUNT(*)
    INTO v_total_votes
    FROM votes
    WHERE case_id = p_case_id;

    -- Require at least 1 vote
    IF v_total_votes = 0 THEN
        RETURN jsonb_build_object(
            'error', 'No votes found for this case',
            'case_id', p_case_id
        );
    END IF;

    -- Calculate average guilt score
    SELECT ROUND(AVG(guilt_score)::numeric, 2)
    INTO v_avg_guilt
    FROM votes
    WHERE case_id = p_case_id;

    -- Determine verdict: guilty if avg >= 6, innocent if < 6
    v_verdict := CASE
        WHEN v_avg_guilt >= 6 THEN 'guilty'
        ELSE 'innocent'
    END;

    -- Count nominal damages approvals
    SELECT 
        COUNT(*) FILTER (WHERE nominal_approved = true),
        COUNT(*) FILTER (WHERE nominal_approved = false)
    INTO v_nominal_approved_count, v_nominal_denied_count
    FROM votes
    WHERE case_id = p_case_id;

    -- Sum punitive damages
    SELECT COALESCE(SUM(punitive_amount), 0)
    INTO v_total_punitive
    FROM votes
    WHERE case_id = p_case_id AND punitive_amount IS NOT NULL;

    -- Calculate total restitution (nominal if majority approved + average punitive)
    v_total_restitution := CASE
        WHEN v_nominal_approved_count > v_nominal_denied_count THEN
            COALESCE((SELECT nominal_damages_claimed FROM cases WHERE id = p_case_id), 0) +
            CASE WHEN v_total_votes > 0 THEN v_total_punitive / v_total_votes ELSE 0 END
        ELSE
            CASE WHEN v_total_votes > 0 THEN v_total_punitive / v_total_votes ELSE 0 END
    END;

    -- Upsert into verdict_results
    INSERT INTO verdict_results (
        case_id,
        verdict,
        average_guilt_score,
        total_votes,
        total_restitution_awarded,
        sealed_at,
        updated_at
    ) VALUES (
        p_case_id,
        v_verdict,
        v_avg_guilt,
        v_total_votes,
        ROUND(v_total_restitution, 2),
        NOW(),
        NOW()
    )
    ON CONFLICT (case_id)
    DO UPDATE SET
        verdict = EXCLUDED.verdict,
        average_guilt_score = EXCLUDED.average_guilt_score,
        total_votes = EXCLUDED.total_votes,
        total_restitution_awarded = EXCLUDED.total_restitution_awarded,
        sealed_at = EXCLUDED.sealed_at,
        updated_at = EXCLUDED.updated_at;

    -- Build result JSON
    v_result := jsonb_build_object(
        'success', true,
        'case_id', p_case_id,
        'verdict', v_verdict,
        'average_guilt_score', v_avg_guilt,
        'total_votes', v_total_votes,
        'nominal_approved', v_nominal_approved_count,
        'nominal_denied', v_nominal_denied_count,
        'total_restitution_awarded', ROUND(v_total_restitution, 2)
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT compute_verdict('your-case-uuid-here');
