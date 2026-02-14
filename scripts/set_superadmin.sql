-- Set denis@crodesign.com as super admin
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Create/update the profile with admin role
INSERT INTO profiles (id, email, role, full_name)
VALUES ('305acb8d-4030-4daf-a57f-00efbebf77a2', 'denis@crodesign.com', 'admin', 'Denis')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. Verify the results
SELECT 'Profile:' as source, id, email, role, full_name FROM profiles WHERE id = '305acb8d-4030-4daf-a57f-00efbebf77a2'
UNION ALL
SELECT 'Role:' as source, user_id, role_id, assigned_at::text, null FROM user_roles WHERE user_id = '305acb8d-4030-4daf-a57f-00efbebf77a2';
