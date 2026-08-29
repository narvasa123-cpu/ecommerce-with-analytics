# Supabase Setup Guide

This guide walks you through setting up Supabase for the E-Commerce Management System.

## Prerequisites

- Supabase account (free tier is sufficient for development)
- Supabase project created

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Project Name: `ecommerce-system`
   - Database Password: Save this securely!
   - Region: Select closest to your location
5. Click "Create new project"
6. Wait for database to initialize (2-3 minutes)

## Step 2: Get Your Credentials

1. Go to Project Settings
2. Click "API" on left sidebar
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
4. Create `.env` file in project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Run Migrations

### Method 1: Using Supabase SQL Editor (Recommended for beginners)

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste content from `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Wait for completion
6. Repeat for `002_rls_policies.sql`
7. Repeat for `003_seed_data.sql`

### Method 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## Step 4: Create Users Through Supabase Auth

### Using Supabase Dashboard

1. Go to Authentication → Users
2. Click "Invite" button
3. Enter email: `admin@example.com`
4. Leave "Send invite email" checked (or unchecked for instant user)
5. Click "Send invite"
6. Repeat for:
   - staff@example.com
   - rider@example.com
   - customer@example.com

### Set Passwords (if auto-invite)

Users will receive invitation email with link to set password.

Or manually set password:
1. Click on user in Auth Users list
2. Click "Reset user password"
3. Send password reset link to user

## Step 5: Create User Profiles

After creating auth users, create their profiles in the database:

1. Go to SQL Editor
2. Run these queries one at a time:

```sql
-- Admin User
INSERT INTO profiles (id, full_name, email, role, is_active) 
SELECT id, 'Alex Santos', email, 'ADMIN', true 
FROM auth.users 
WHERE email = 'admin@example.com';

-- Staff User
INSERT INTO profiles (id, full_name, email, role, is_active) 
SELECT id, 'Maria Cruz', email, 'STAFF', true 
FROM auth.users 
WHERE email = 'staff@example.com';

-- Rider User
INSERT INTO profiles (id, full_name, email, role, is_active) 
SELECT id, 'Juan Dela Cruz', email, 'RIDER', true 
FROM auth.users 
WHERE email = 'rider@example.com';

-- Customer User
INSERT INTO profiles (id, full_name, email, role, is_active) 
SELECT id, 'Daniel Reyes', email, 'CUSTOMER', true 
FROM auth.users 
WHERE email = 'customer@example.com';
```

## Step 6: Verify Setup

### Check Authentication

```bash
# Start the app
npm run dev

# Try logging in with one of the test accounts
# Email: customer@example.com
# Password: (the password you set)
```

### Check Database

1. Go to Supabase Dashboard
2. Click "Browser" in left sidebar
3. You should see tables:
   - profiles
   - categories
   - products
   - orders
   - etc.

### Verify RLS Policies

1. Go to Authentication → Policies
2. You should see policies for each table
3. Verify they're enabled (toggle should be ON)

## Step 7: Seed Sample Data

The initial schema includes seed data for:
- 4 Categories
- 5 Sample Products

If you need more data, you can manually insert it:

```sql
-- Add more products
INSERT INTO products (category_id, sku, name, description, price, stock_quantity, minimum_stock, is_active)
SELECT 
  (SELECT id FROM categories WHERE name = 'Electronics'),
  'ELEC-004',
  'USB 3.0 Hub',
  'Multi-port USB hub with fast data transfer',
  699.00,
  30,
  5,
  true;
```

## Step 8: Enable Features (Optional)

### Enable Realtime (for notifications)

1. Go to Realtime → Manage Realtime
2. Select tables you want to monitor:
   - orders
   - deliveries
   - notifications
3. Click "Enable"

### Set Up Backup

1. Go to Settings → Backups
2. Choose backup frequency (Daily/Weekly)
3. Enable "Automatic backups"

## Troubleshooting

### RLS Policies Not Working

1. Verify policies are enabled:
   - Go to Authentication → Policies
   - Check toggle is ON for each policy

2. Check user role in profiles:
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'user@example.com';
   ```

3. Test RLS manually:
   ```sql
   -- This will show what the user can access
   SELECT * FROM profiles LIMIT 5;
   ```

### Can't Connect to Supabase

1. Verify credentials in `.env` file
2. Check internet connection
3. Check Supabase project status (should be green)
4. Try refreshing the page

### Migrations Failed

1. Check SQL syntax
2. Run migrations one at a time
3. Check for existing tables/conflicts
4. Clear browser cache and retry

### Auth Issues

1. Verify email addresses are unique
2. Check user is active in Supabase Auth
3. Verify profile exists for user
4. Check RLS policies allow the operation

## Common Tasks

### Reset Database

⚠️ **WARNING**: This deletes all data!

```sql
-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT CREATE ON SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres, anon, authenticated, service_role;
```

Then re-run all migrations.

### Add Test Order

```sql
-- Insert test order
INSERT INTO orders (
  order_number,
  user_id,
  contact_number,
  status,
  subtotal,
  delivery_fee,
  discount,
  total
) VALUES (
  'ORD-' || to_char(NOW(), 'YYMMDDhhmm'),
  (SELECT id FROM profiles WHERE email = 'customer@example.com' LIMIT 1),
  '09123456789',
  'PENDING',
  2098.00,
  100.00,
  0.00,
  2198.00
);
```

### Check Server Health

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Next Steps

1. ✅ Create Supabase project
2. ✅ Get credentials
3. ✅ Run migrations
4. ✅ Create test users
5. ✅ Create profiles
6. ✅ Verify setup
7. → Start application development
8. → Add features
9. → Test thoroughly
10. → Deploy to production

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase/discussions
- Project Issues: Check project README.md
