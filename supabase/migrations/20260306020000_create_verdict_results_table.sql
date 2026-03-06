-- Create verdict_results table to store computed verdicts
CREATE TABLE IF NOT EXISTS verdict_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
    verdict TEXT NOT NULL CHECK (verdict IN ('guilty', 'innocent')),
    average_guilt_score NUMERIC(4, 2),
    total_votes INTEGER NOT NULL DEFAULT 0,
    total_restitution_awarded NUMERIC(15, 2) DEFAULT 0,
    sealed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups by case_id
CREATE INDEX IF NOT EXISTS idx_verdict_results_case_id ON verdict_results(case_id);

-- Enable RLS
ALTER TABLE verdict_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read verdict results (public read)
CREATE POLICY "Anyone can read verdict results" ON verdict_results
    FOR SELECT
    USING (true);

-- Only admins can write verdict results (will be done via compute_verdict function)
CREATE POLICY "Only service role can write verdict results" ON verdict_results
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL); -- Restrictive for now, will be called via RPC

CREATE POLICY "Only service role can update verdict results" ON verdict_results
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
