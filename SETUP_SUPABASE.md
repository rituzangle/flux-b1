# Supabase Setup Guide for Flux

This guide walks you through setting up your Supabase database for the Flux payment application.

## Prerequisites

- Supabase account and project created
- Environment variables configured in `.env.local`
- Node.js 20.x installed

## Step 1: Verify Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Step 2: Apply Database Migrations

### 2.1 Create Base Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `db/migrations/001_create_schema.sql`
3. Paste and execute
4. Verify tables created:
   - `app_users`
   - `charities`
   - `transactions`
   - `subscriptions`
   - `bills`
   - `insights`

### 2.2 Create RPC Functions

1. In SQL Editor, copy contents of `db/migrations/002_create_rpc_functions.sql`
2. Paste and execute
3. Verify functions created:
   - `atomic_apply_donation()`
   - `atomic_apply_send()`
   - `get_user_profile()`

## Step 3: Seed Initial Data

### 3.1 Seed Charities

```bash
npm run db:seed-charities
```

This populates the `charities` table with 8 verified charities including:
- World Food Program
- Khalsa Aid
- American Red Cross
- UNICEF
- Save the Children
- Children International
- Water Aid
- Family Giving Tree

**Expected Output:**
```
🌱 Starting charity seeding process...
📍 Supabase URL: https://your-project.supabase.co
📊 Charities to seed: 8

➕ Inserting: World Food Program
   ✅ Inserted successfully
...
✅ Seeding complete!
```

### 3.2 Create Test User

```bash
npm run db:create-user
```

This creates a test user with:
- Email: `test@flux.app`
- Balance: $1,250.00
- Total Donated: $0.00

**Expected Output:**
```
👤 Creating test user...
✅ Test user created successfully!

📋 User Details:
   User ID: 7db3864f-266a-4744-9d64-753abc9598a0
   Email: test@flux.app
   Name: Test User
   Balance: $1250.00
```

**Save the User ID** - you'll need it for testing!

#### Custom User Options

```bash
# Custom email and balance
npm run db:create-user -- --email=jane@example.com --balance=2000

# Custom name
npm run db:create-user -- --email=john@example.com --name="John Doe" --balance=500
```

## Step 4: Test API Connectivity

### 4.1 Verify Supabase Connection

```bash
npm run check:supabase
```

**Expected Output:**
```
✅ Supabase environment variables are set
✅ Server client (service role) initialized
✅ Client client (anon key) initialized
✅ Server query succeeded: 8 charities
✅ Client query succeeded: 8 charities
```

### 4.2 Test Transactions Endpoint

```bash
npm run db:test-transactions -- --userId=YOUR_USER_ID
```

Replace `YOUR_USER_ID` with the ID from Step 3.2.

**Expected Output (no transactions yet):**
```
🧪 Testing Transactions API
📍 API Base: http://localhost:3000
👤 User ID: 7db3864f-266a-4744-9d64-753abc9598a0

📊 HTTP Status: 200 OK
✅ Found 0 transactions (total: 0)

⚠️  No transactions found.
```

## Step 5: Create Sample Transactions

### Option A: Via SQL (Quick Test)

Execute in Supabase SQL Editor:

```sql
-- Get your user ID first
SELECT id, email, balance FROM app_users LIMIT 1;

-- Insert a test donation (replace USER_ID_HERE with actual UUID)
INSERT INTO transactions (
  user_id,
  type,
  category,
  entity_id,
  entity_name,
  amount,
  direction,
  note,
  meta,
  insights
) VALUES (
  'USER_ID_HERE',
  'donation',
  'charity',
  (SELECT id::text FROM charities WHERE slug = 'world-food-program'),
  'World Food Program',
  25.00,
  'outgoing',
  'Test donation via SQL',
  '{"impactRate": 2, "impactMetric": "meals"}'::jsonb,
  '[{"message": "Your donation will provide 50 meals!", "meta": {"generated": true}}]'::jsonb
);

-- Update user balance
UPDATE app_users
SET
  balance = balance - 25.00,
  total_donated = total_donated + 25.00
WHERE id = 'USER_ID_HERE';
```

### Option B: Via App (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Use the onboarding flow to make a donation
4. The donation will be recorded via the `atomic_apply_donation` RPC

### Option C: Via API (Direct)

```bash
curl -X POST http://localhost:3000/api/donate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "charityId": "CHARITY_ID_FROM_DB",
    "amount": 25.00,
    "note": "Test donation via API"
  }'
```

## Step 6: Verify Everything Works

### 6.1 Check User Profile

```bash
curl "http://localhost:3000/api/user?userId=YOUR_USER_ID"
```

**Expected Response:**
```json
{
  "ok": true,
  "id": "7db3864f-266a-4744-9d64-753abc9598a0",
  "name": "Test User",
  "email": "test@flux.app",
  "balance": 1225.00,
  "totalDonated": 25.00,
  "onboardingComplete": true
}
```

### 6.2 Check Transactions

```bash
npm run db:test-transactions -- --userId=YOUR_USER_ID
```

**Expected Output:**
```
✅ Found 1 transactions (total: 1)

📋 Transaction Summary:

   1. DONATION - World Food Program
      Amount: $25.00 (outgoing)
      Date: 10/21/2025, 12:00:00 AM
      Insights: Your donation will provide 50 meals!

✅ All transactions include type and entity_name/entity_id
✅ Test complete!
```

### 6.3 Check Charities

```bash
curl "http://localhost:3000/api/charities"
```

Should return 8 charities with full metadata.

## Common Issues & Solutions

### Issue: "Missing required environment variables"

**Solution:** Verify `.env.local` exists and contains all three required variables. Restart the dev server after changes.

### Issue: "Table does not exist"

**Solution:** Run migrations in order:
1. First: `001_create_schema.sql`
2. Then: `002_create_rpc_functions.sql`

### Issue: "Function atomic_apply_donation does not exist"

**Solution:** Run `002_create_rpc_functions.sql` in Supabase SQL Editor.

### Issue: "Insufficient balance" when testing donations

**Solution:**
```sql
UPDATE app_users SET balance = 5000.00 WHERE email = 'test@flux.app';
```

### Issue: Charities not showing in app

**Solution:**
```bash
# Re-seed charities
npm run db:seed-charities

# Verify in SQL Editor
SELECT id, name, slug FROM charities;
```

## Database Maintenance Scripts

### Add More Balance to Test User

```sql
UPDATE app_users
SET balance = balance + 1000.00
WHERE email = 'test@flux.app';
```

### Reset Test User

```sql
UPDATE app_users
SET
  balance = 1250.00,
  total_donated = 0.00
WHERE email = 'test@flux.app';

DELETE FROM transactions
WHERE user_id = (SELECT id FROM app_users WHERE email = 'test@flux.app');
```

### View Recent Activity

```sql
SELECT
  t.type,
  t.entity_name,
  t.amount,
  t.direction,
  t.timestamp,
  u.email
FROM transactions t
JOIN app_users u ON t.user_id = u.id
ORDER BY t.timestamp DESC
LIMIT 10;
```

## Next Steps

1. ✅ Database schema created
2. ✅ RPC functions deployed
3. ✅ Charities seeded
4. ✅ Test user created
5. ✅ API connectivity verified
6. 🎯 **Ready to test the app!**

Start the dev server and test the full flow:

```bash
npm run dev
```

Open http://localhost:3000 and explore the app with your Supabase database!

## Architecture Notes

### Client Usage

- **Server-side (API routes):** Use `supabaseAdmin` from `@/src/lib/boltDatabaseClient`
- **Client-side (browser):** Use `supabaseClient` from `@/src/lib/boltDatabaseClient`

### RPC Functions

All payment operations use atomic RPC functions:
- `atomic_apply_donation` - Handles donations with balance updates
- `atomic_apply_send` - Handles money transfers between users
- `get_user_profile` - Returns enriched user profile with stats

### Data Flow

```
User Action → API Route → RPC Function → Database Update → Response
```

All operations are atomic and transactional - either everything succeeds or nothing changes.

## Support

For issues or questions:
1. Check Supabase logs: Dashboard → Logs
2. Check app logs: Terminal where `npm run dev` is running
3. Review migration files: `db/migrations/*.sql`
4. Test scripts: `scripts/*.js`

---

**Status:** Ready for development and testing! 🚀
