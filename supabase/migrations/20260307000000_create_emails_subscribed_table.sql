-- Create emails_subscribed table for newsletter signup
CREATE TABLE IF NOT EXISTS emails_subscribed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'web',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_emails_subscribed_email ON emails_subscribed(email);

-- Enable RLS
ALTER TABLE emails_subscribed ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (no auth required for newsletter signup)
CREATE POLICY "Anyone can subscribe" ON emails_subscribed
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated users can read their own subscription (service role can read all)
CREATE POLICY "Users can read own subscription" ON emails_subscribed
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR
        email = auth.jwt() ->> 'email'
    );

-- Only service role can update subscriptions
CREATE POLICY "Service role can update subscriptions" ON emails_subscribed
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
