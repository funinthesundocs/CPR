-- Add voting_deadline column to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS voting_deadline timestamptz;

-- Add comment for clarity
COMMENT ON COLUMN cases.voting_deadline IS 'Optional deadline for voting on this case';
