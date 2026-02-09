# Running Permissions Setup

## Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `scripts/create_permissions_schema.sql`
5. Click **Run**
6. Create another new query
7. Copy and paste the contents of `scripts/seed_permissions_data.sql`
8. Click **Run**

## Option 2: Via psql CLI

If you have direct database access:

```bash
# Run both scripts in order
psql -h <your-host> -U postgres -d postgres -f scripts/create_permissions_schema.sql
psql -h <your-host> -U postgres -d postgres -f scripts/seed_permissions_data.sql
```

## Verification

After running the scripts, verify the setup:

```sql
-- Check roles
SELECT * FROM roles ORDER BY id;

-- Check permissions
SELECT * FROM permissions ORDER BY category, id;

-- Check role-permission mappings
SELECT r.name as role, p.name as permission, rp.granted
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
ORDER BY r.name, p.category, p.name;
```

You should see:
- 11 roles
- 19 permissions
- Default permission grants for each role

## Next Steps

Once the database is set up, the roles management page at `/admin/users/roles` will automatically connect to the database and allow you to modify permissions in real-time.
