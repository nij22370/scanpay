# Supabase Setup

This guide walks through creating the Supabase project, applying the schema,
and enabling Row Level Security (RLS) on every table.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project** (or **New organization** first if you have none).
3. Fill in:
   - **Project Name**: `scanpay`
   - **Database Password**: a strong, random password (store it in a password manager)
   - **Region**: `Asia Pacific (Singapore)` or nearest to Nepal
   - **Organization**: select or create one
4. Click **Create project**. Supabase provisions a PostgreSQL instance and
   prints the `Project API URL` and `Project API key` (anon + service role).

## 2. Copy Credentials into `.env.local`

From the project dashboard → Settings → API, copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

These are already present in `.env.local.example`. Replace the placeholders
with the real values from your project. **Never commit `.env.local`.**

## 3. Apply the Schema

Open the SQL editor in the Supabase dashboard and paste the contents of
`supabase/schema.sql`, then click **Run**.

The script creates four tables:

| Table              | Purpose                                            |
|--------------------|----------------------------------------------------|
| `products`         | Catalog of saleable items                          |
| `transactions`     | One row per completed payment                      |
| `split_sessions`   | A split-bill group linked to a transaction         |
| `split_participants` | Each person's share inside a split session      |

It also:
- Creates indexes on `barcode`, `category`, `is_active`, `transaction_number`,
  `payment_provider`, `payment_status`, `created_by`, `created_at`,
  `transaction_id`, `status`, `split_session_id`, and `user_id`.
- Enables Row Level Security on **all four** tables.
- Adds basic RLS policies (authenticated read on `products`,
  authenticated read/create/update on `transactions` and `split_sessions`,
  authenticated read/create on `split_participants`).
- Installs a `update_updated_at()` trigger function and attaches it to
  `products`, `transactions`, and `split_sessions`.

## 4. Verify RLS is Enabled

Run this query in the SQL editor:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'transactions', 'split_sessions', 'split_participants');
```

All four rows must return `rowsecurity = true`.

## 5. Verify the Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products', 'transactions', 'split_sessions', 'split_participants')
ORDER BY table_name;
```

Expected output:

```
products
split_participants
split_sessions
transactions
```

## 6. Seed Sample Data (Optional)

```sql
INSERT INTO products (name, description, price, cost_price, stock, category, barcode)
VALUES
  ('Momo (Chicken)', 'Steamed chicken momos (4 pcs)', 120.00, 60.00, 25, 'Snacks', 'MOMO001'),
  ('Momo (Buff)', 'Steamed buffalo momos (4 pcs)', 130.00, 65.00, 20, 'Snacks', 'MOMO002'),
  ('Tea (Masala)', 'Hot masala tea', 40.00, 15.00, 50, 'Beverages', 'TEA001'),
  ('Coffee', 'Hot coffee', 50.00, 20.00, 40, 'Beverages', 'COF001');
```

## 7. Service Role Key Warning

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is **server-only** — use it only
in `src/app/api/**` routes and `src/lib/supabase/admin.ts`. Never expose it
to the browser or bundle it in client JavaScript.

## 8. Local Verification

```bash
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

Visit `http://localhost:3000` to confirm the app boots.