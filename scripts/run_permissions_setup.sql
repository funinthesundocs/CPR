-- Run Permissions System Setup
-- This script combines schema creation and seeding in the correct order
--
-- Execute this in Supabase SQL Editor or using psql:
-- psql -h <host> -U postgres -d postgres -f scripts/run_permissions_setup.sql

\echo 'Creating permissions system schema...'
\i scripts/create_permissions_schema.sql

\echo 'Seeding permissions data...'
\i scripts/seed_permissions_data.sql

\echo 'Permissions system setup complete!'
\echo 'You can now manage roles and permissions from /admin/users/roles'
