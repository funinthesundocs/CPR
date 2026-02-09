-- Add admin role to user denis@crodesign.com
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/lcthxjtcicbtirsxkxbh/sql

-- First, check if the user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'denis@crodesign.com';

-- Update the profile to have admin role
-- (This assumes the user has already signed up and has a profile)
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'denis@crodesign.com');

-- Verify the update
SELECT p.id, u.email, p.role 
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'denis@crodesign.com';
