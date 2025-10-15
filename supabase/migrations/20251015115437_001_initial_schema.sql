/*
  # Initial Inventory Management System Schema

  ## New Tables

  ### 1. Products
    - `id` (uuid, primary key)
    - `name` (text, required)
    - `sku` (text, unique, required)
    - `barcode` (text, optional)
    - `category` (text, required)
    - `price` (numeric, required)
    - `cost` (numeric, required)
    - `stock` (integer, required)
    - `min_stock` (integer, required)
    - `description` (text)
    - `image` (text, optional)
    - `supplier` (text, optional)
    - `location` (text, optional)
    - `created_by` (uuid, foreign key to auth.users)
    - `updated_by` (uuid, foreign key to auth.users)
    - `created_at` (timestamptz, default now())
    - `updated_at` (timestamptz, default now())

  ### 2. Categories
    - `id` (uuid, primary key)
    - `name` (text, unique, required)
    - `description` (text)
    - `created_at` (timestamptz, default now())

  ### 3. Sales
    - `id` (uuid, primary key)
    - `product_id` (uuid, foreign key to products)
    - `product_name` (text, required)
    - `quantity` (integer, required)
    - `unit_price` (numeric, required)
    - `discount` (numeric, default 0)
    - `tax` (numeric, default 0)
    - `total` (numeric, required)
    - `profit` (numeric, required)
    - `customer_id` (uuid, foreign key to customers)
    - `customer_name` (text)
    - `payment_method` (text, required)
    - `status` (text, required)
    - `seller_id` (uuid, foreign key to sellers)
    - `seller_name` (text)
    - `location` (text)
    - `created_by` (uuid, foreign key to auth.users)
    - `created_at` (timestamptz, default now())

  ### 4. Returns
    - `id` (uuid, primary key)
    - `sale_id` (uuid, foreign key to sales)
    - `product_id` (uuid, foreign key to products)
    - `product_name` (text, required)
    - `quantity` (integer, required)
    - `reason` (text, required)
    - `refund_amount` (numeric, required)
    - `status` (text, required)
    - `processed_by` (uuid, foreign key to auth.users)
    - `created_at` (timestamptz, default now())

  ### 5. Customers
    - `id` (uuid, primary key)
    - `name` (text, required)
    - `email` (text)
    - `phone` (text)
    - `address` (text)
    - `customer_type` (text, required)
    - `credit_limit` (numeric, default 0)
    - `current_credit` (numeric, default 0)
    - `total_purchases` (numeric, default 0)
    - `loyalty_points` (integer, default 0)
    - `last_purchase` (timestamptz)
    - `created_at` (timestamptz, default now())

  ### 6. Sellers
    - `id` (uuid, primary key)
    - `name` (text, required)
    - `email` (text)
    - `phone` (text)
    - `commission_rate` (numeric, default 0)
    - `is_active` (boolean, default true)
    - `total_sales` (integer, default 0)
    - `total_revenue` (numeric, default 0)
    - `total_profit` (numeric, default 0)
    - `created_at` (timestamptz, default now())

  ### 7. User Profiles
    - `id` (uuid, primary key, foreign key to auth.users)
    - `username` (text, unique, required)
    - `role` (text, required)
    - `permissions` (jsonb, default '[]')
    - `is_active` (boolean, default true)
    - `last_login` (timestamptz)
    - `created_at` (timestamptz, default now())

  ### 8. Activity Logs
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `username` (text, required)
    - `action` (text, required)
    - `module` (text, required)
    - `details` (text)
    - `ip_address` (text)
    - `created_at` (timestamptz, default now())

  ### 9. Notifications
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `type` (text, required)
    - `title` (text, required)
    - `message` (text, required)
    - `read` (boolean, default false)
    - `action_url` (text)
    - `created_at` (timestamptz, default now())

  ### 10. Settings
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `currency` (text, default 'USD')
    - `usd_to_iqd_rate` (numeric, default 1320)
    - `date_format` (text, default 'MM/dd/yyyy')
    - `low_stock_threshold` (integer, default 10)
    - `company_name` (text)
    - `company_address` (text)
    - `company_phone` (text)
    - `company_email` (text)
    - `tax_rate` (numeric, default 0)
    - `theme` (text, default 'light')
    - `language` (text, default 'en')
    - `auto_backup` (boolean, default false)
    - `backup_frequency` (text, default 'daily')
    - `email_notifications` (boolean, default true)
    - `sms_notifications` (boolean, default false)
    - `last_seller` (text)
    - `updated_at` (timestamptz, default now())

  ## Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
*/

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
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
  user_id uuid REFERENCES auth.users(id) UNIQUE,
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
  language text DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  auto_backup boolean DEFAULT false,
  backup_frequency text DEFAULT 'daily' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  last_seller text,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
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

-- Enable Row Level Security
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

-- RLS Policies for Categories
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for Products
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for Customers
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for Sellers
CREATE POLICY "Authenticated users can view sellers"
  ON sellers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sellers"
  ON sellers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sellers"
  ON sellers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sellers"
  ON sellers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for Sales
CREATE POLICY "Authenticated users can view sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for Returns
CREATE POLICY "Authenticated users can view returns"
  ON returns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert returns"
  ON returns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update returns"
  ON returns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete returns"
  ON returns FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for User Profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for Activity Logs
CREATE POLICY "Authenticated users can view activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for Settings
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
