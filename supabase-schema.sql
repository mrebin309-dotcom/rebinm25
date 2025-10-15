-- Inventory Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  barcode text,
  category text NOT NULL,
  price decimal NOT NULL DEFAULT 0,
  cost decimal NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  description text DEFAULT '',
  image text,
  supplier text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  updated_by text
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT ''
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal NOT NULL DEFAULT 0,
  discount decimal NOT NULL DEFAULT 0,
  tax decimal NOT NULL DEFAULT 0,
  total decimal NOT NULL DEFAULT 0,
  profit decimal NOT NULL DEFAULT 0,
  customer_id text,
  customer_name text,
  payment_method text NOT NULL DEFAULT 'cash',
  date timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'completed',
  seller_id text,
  seller_name text,
  location text
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to sales" ON sales FOR ALL USING (true) WITH CHECK (true);

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid,
  product_id uuid,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  reason text NOT NULL,
  refund_amount decimal NOT NULL DEFAULT 0,
  date timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  processed_by text
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to returns" ON returns FOR ALL USING (true) WITH CHECK (true);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  customer_type text NOT NULL DEFAULT 'retail',
  credit_limit decimal NOT NULL DEFAULT 0,
  current_credit decimal NOT NULL DEFAULT 0,
  total_purchases decimal NOT NULL DEFAULT 0,
  loyalty_points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_purchase timestamptz
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  commission_rate decimal DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  total_sales integer DEFAULT 0,
  total_revenue decimal DEFAULT 0,
  total_profit decimal DEFAULT 0
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to sellers" ON sellers FOR ALL USING (true) WITH CHECK (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  date timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  user_id text,
  action_url text
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency text DEFAULT 'USD',
  usd_to_iqd_rate decimal DEFAULT 1500,
  date_format text DEFAULT 'MM/DD/YYYY',
  low_stock_threshold integer DEFAULT 10,
  company_name text DEFAULT 'My Company',
  company_address text DEFAULT '',
  company_phone text DEFAULT '',
  company_email text DEFAULT '',
  tax_rate decimal DEFAULT 0,
  theme text DEFAULT 'light',
  language text DEFAULT 'en',
  auto_backup boolean DEFAULT false,
  backup_frequency text DEFAULT 'daily',
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  last_seller text
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default settings record
INSERT INTO settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_returns_date ON returns(date);
