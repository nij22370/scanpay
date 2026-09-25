-- Create tables for ScanPay
-- Run this in Supabase SQL editor or via migration

-- 1. Products Table (PRD §9)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_np TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  vat_applicable BOOLEAN NOT NULL DEFAULT false,
  barcode TEXT UNIQUE,
  qr_data TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_provider TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'completed',
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  slip_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_provider ON transactions(payment_provider);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- 2b. Transaction Items Table
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);

-- 3. Split Sessions Table
CREATE TABLE IF NOT EXISTS split_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_split_sessions_transaction ON split_sessions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_split_sessions_status ON split_sessions(status);

-- 4. Split Participants Table
CREATE TABLE IF NOT EXISTS split_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  split_session_id UUID NOT NULL REFERENCES split_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_amount NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_split_participants_session ON split_participants(split_session_id);
CREATE INDEX IF NOT EXISTS idx_split_participants_user ON split_participants(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_participants ENABLE ROW LEVEL SECURITY;

-- Products RLS Policies (allow full CRUD for application operations)
CREATE POLICY "Allow read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow insert products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update products"
  ON products FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete products"
  ON products FOR DELETE
  USING (true);

-- Transactions RLS Policies
CREATE POLICY "Allow read transactions"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Allow insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update transactions"
  ON transactions FOR UPDATE
  USING (true);

-- Split Sessions RLS Policies
CREATE POLICY "Allow read split sessions"
  ON split_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow insert split sessions"
  ON split_sessions FOR INSERT
  WITH CHECK (true);

-- Transaction Items RLS Policies
CREATE POLICY "Allow read transaction items"
  ON transaction_items FOR SELECT
  USING (true);

CREATE POLICY "Allow insert transaction items"
  ON transaction_items FOR INSERT
  WITH CHECK (true);

-- Split Participants RLS Policies
CREATE POLICY "Allow read split participants"
  ON split_participants FOR SELECT
  USING (true);

CREATE POLICY "Allow insert split participants"
  ON split_participants FOR INSERT
  WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_split_sessions_updated_at
  BEFORE UPDATE ON split_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
