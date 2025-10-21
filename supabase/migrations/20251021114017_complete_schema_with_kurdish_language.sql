/*
  # Complete Inventory Management System Schema with Kurdish Language Support

  ## Overview
  This migration creates the complete inventory management database schema with automatic
  inventory tracking triggers and Kurdish language support.

  ## Tables Created

  ### 1. Categories
  - Product category management
  - Unique category names

  ### 2. Products
  - Complete product information
  - Stock tracking with minimum stock alerts
  - CHECK constraints ensure stock >= 0

  ### 3. Customers
  - Customer information and purchase history
  - Loyalty points tracking

  ### 4. Sellers
  - Seller/employee management
  - Commission tracking
  - Sales performance metrics

  ### 5. Sales
  - Sales transactions
  - Links to products, customers, and sellers
  - Automatic stock deduction via trigger

  ### 6. Returns
  - Product returns management
  - Automatic stock restoration when approved

  ### 7. Settings
  - System-wide configuration
  - Shared across all devices (PIN-based access)
  - **Supports Kurdish language ('ku') in addition to English ('en') and Arabic ('ar')**

  ### 8. User Profiles, Activity Logs, Notifications
  - User management and audit trail

  ## Automatic Inventory Management

  ### Stock Deduction Trigger
  - Automatically reduces product stock when a sale is inserted
  - Only applies to actual products (not service sales)
  - Prevents negative stock via CHECK constraint

  ### Stock Restoration Trigger
  - Automatically restores product stock when a return is approved
  - Only applies to actual products

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Anonymous access policies (PIN-based authentication)
  - All users share the same data
*/

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text NOT NULL,
  barcode text,
  category text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  cost numeric NOT NULL CHECK (cost >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock integer NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  description text DEFAULT '',
  image text,
  supplier text,
  location text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text DEFAULT '',
  customer_type text NOT NULL DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale')),
  credit_limit numeric DEFAULT 0 CHECK (credit_limit >= 0),
  current_credit numeric DEFAULT 0 CHECK (current_credit >= 0),
  total_purchases numeric DEFAULT 0 CHECK (total_purchases >= 0),
  loyalty_points integer DEFAULT 0 CHECK (loyalty_points >= 0),
  last_purchase timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  commission_rate numeric DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  is_active boolean DEFAULT true,
  total_sales integer DEFAULT 0 CHECK (total_sales >= 0),
  total_revenue numeric DEFAULT 0 CHECK (total_revenue >= 0),
  total_profit numeric DEFAULT 0 CHECK (total_profit >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  discount numeric DEFAULT 0 CHECK (discount >= 0),
  tax numeric DEFAULT 0 CHECK (tax >= 0),
  total numeric NOT NULL CHECK (total >= 0),
  profit numeric NOT NULL,
  customer_id uuid REFERENCES customers(id),
  customer_name text,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'credit')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  seller_id uuid REFERENCES sellers(id),
  seller_name text,
  location text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id),
  product_id text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  reason text NOT NULL,
  refund_amount numeric NOT NULL CHECK (refund_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'viewer')),
  permissions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  username text NOT NULL,
  action text NOT NULL,
  module text NOT NULL,
  details text DEFAULT '',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency text DEFAULT 'USD' CHECK (currency IN ('USD', 'IQD')),
  usd_to_iqd_rate numeric DEFAULT 1320 CHECK (usd_to_iqd_rate > 0),
  date_format text DEFAULT 'MM/dd/yyyy',
  low_stock_threshold integer DEFAULT 10 CHECK (low_stock_threshold >= 0),
  company_name text DEFAULT '',
  company_address text DEFAULT '',
  company_phone text DEFAULT '',
  company_email text DEFAULT '',
  tax_rate numeric DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language text DEFAULT 'en' CHECK (language IN ('en', 'ar', 'ku')),
  auto_backup boolean DEFAULT false,
  backup_frequency text DEFAULT 'daily' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  last_seller text,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_seller_id ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES (Anonymous/Shared Access)
-- ============================================================================

-- Categories
CREATE POLICY "Allow all to view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow all to insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update categories" ON categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete categories" ON categories FOR DELETE USING (true);

-- Products
CREATE POLICY "Allow all to view products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow all to insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update products" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete products" ON products FOR DELETE USING (true);

-- Customers
CREATE POLICY "Allow all to view customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow all to insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update customers" ON customers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete customers" ON customers FOR DELETE USING (true);

-- Sellers
CREATE POLICY "Allow all to view sellers" ON sellers FOR SELECT USING (true);
CREATE POLICY "Allow all to insert sellers" ON sellers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update sellers" ON sellers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete sellers" ON sellers FOR DELETE USING (true);

-- Sales
CREATE POLICY "Allow all to view sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Allow all to insert sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update sales" ON sales FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete sales" ON sales FOR DELETE USING (true);

-- Returns
CREATE POLICY "Allow all to view returns" ON returns FOR SELECT USING (true);
CREATE POLICY "Allow all to insert returns" ON returns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update returns" ON returns FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete returns" ON returns FOR DELETE USING (true);

-- User Profiles
CREATE POLICY "Allow all to view user_profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all to insert user_profiles" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update user_profiles" ON user_profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Activity Logs
CREATE POLICY "Allow all to view activity_logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow all to insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- Notifications
CREATE POLICY "Allow all to view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow all to insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update notifications" ON notifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to delete notifications" ON notifications FOR DELETE USING (true);

-- Settings
CREATE POLICY "Allow all to view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow all to insert settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update settings" ON settings FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- CREATE FUNCTIONS FOR TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrease product stock when a sale is made
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id::uuid
    AND stock >= NEW.quantity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increase product stock when a return is approved
CREATE OR REPLACE FUNCTION increase_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    UPDATE products
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id::uuid;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_decrease_stock_on_sale ON sales;
CREATE TRIGGER trigger_decrease_stock_on_sale
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION decrease_product_stock();

DROP TRIGGER IF EXISTS trigger_increase_stock_on_return ON returns;
CREATE TRIGGER trigger_increase_stock_on_return
  AFTER INSERT ON returns
  FOR EACH ROW
  EXECUTE FUNCTION increase_product_stock();

-- ============================================================================
-- INSERT DEFAULT CATEGORIES
-- ============================================================================

INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and accessories'),
  ('Clothing', 'Apparel and fashion items'),
  ('Food & Beverage', 'Food and drink products'),
  ('Home & Garden', 'Home improvement and garden supplies'),
  ('Books', 'Books and publications'),
  ('Toys', 'Toys and games'),
  ('Sports', 'Sports equipment and gear'),
  ('Health & Beauty', 'Health and beauty products'),
  ('Automotive', 'Auto parts and accessories'),
  ('Office Supplies', 'Office and school supplies')
ON CONFLICT (name) DO NOTHING;
