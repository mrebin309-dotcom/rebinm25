/*
  # Remove Authentication Requirements for PIN-only Access

  ## Changes Made
  
  1. **Settings Table**
     - Remove user_id foreign key requirement
     - Allow shared settings for all users with PIN access
  
  2. **Products Table**
     - Make created_by and updated_by nullable (optional tracking)
  
  3. **Sales Table**
     - Make created_by nullable
  
  4. **Returns Table**
     - Make processed_by nullable
  
  5. **RLS Policies**
     - Update all policies to allow access without authentication
     - Data is shared across all devices with PIN access
  
  ## Security Note
  All data is now shared across devices. Access control is managed via PIN entry only.
*/

-- Drop all existing RLS policies first
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own products" ON products;
  DROP POLICY IF EXISTS "Users can insert own products" ON products;
  DROP POLICY IF EXISTS "Users can update own products" ON products;
  DROP POLICY IF EXISTS "Users can delete own products" ON products;
  DROP POLICY IF EXISTS "Users can view all sales" ON sales;
  DROP POLICY IF EXISTS "Users can insert sales" ON sales;
  DROP POLICY IF EXISTS "Users can view all returns" ON returns;
  DROP POLICY IF EXISTS "Users can insert returns" ON returns;
  DROP POLICY IF EXISTS "Users can update returns" ON returns;
  DROP POLICY IF EXISTS "Users can view all customers" ON customers;
  DROP POLICY IF EXISTS "Users can insert customers" ON customers;
  DROP POLICY IF EXISTS "Users can view all sellers" ON sellers;
  DROP POLICY IF EXISTS "Users can insert sellers" ON sellers;
  DROP POLICY IF EXISTS "Users can update sellers" ON sellers;
  DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
  DROP POLICY IF EXISTS "Users can update their own settings" ON settings;
  DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;
  DROP POLICY IF EXISTS "Users can view own settings" ON settings;
  DROP POLICY IF EXISTS "Users can update own settings" ON settings;
  DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
END $$;

-- Alter settings table to remove user_id requirement
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;
    ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_user_id_key;
    ALTER TABLE settings DROP COLUMN user_id CASCADE;
  END IF;
END $$;

-- Make created_by and updated_by nullable in products
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE products ALTER COLUMN created_by DROP NOT NULL;
    ALTER TABLE products ALTER COLUMN updated_by DROP NOT NULL;
  END IF;
END $$;

-- Make created_by nullable in sales
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE sales ALTER COLUMN created_by DROP NOT NULL;
  END IF;
END $$;

-- Make processed_by nullable in returns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'returns' AND column_name = 'processed_by'
  ) THEN
    ALTER TABLE returns ALTER COLUMN processed_by DROP NOT NULL;
  END IF;
END $$;

-- Create new RLS policies for anonymous access (all users share data)

-- Products policies
CREATE POLICY "Allow all to view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete products"
  ON products FOR DELETE
  USING (true);

-- Sales policies
CREATE POLICY "Allow all to view sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert sales"
  ON sales FOR INSERT
  WITH CHECK (true);

-- Returns policies
CREATE POLICY "Allow all to view returns"
  ON returns FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert returns"
  ON returns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update returns"
  ON returns FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Customers policies
CREATE POLICY "Allow all to view customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Categories policies
CREATE POLICY "Allow all to view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

-- Sellers policies
CREATE POLICY "Allow all to view sellers"
  ON sellers FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert sellers"
  ON sellers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update sellers"
  ON sellers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Settings policies (shared across all devices)
CREATE POLICY "Allow all to view settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert settings"
  ON settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update settings"
  ON settings FOR UPDATE
  USING (true)
  WITH CHECK (true);