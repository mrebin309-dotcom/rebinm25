/*
  # Add Missing Anonymous Access Policies

  ## Changes Made
  
  1. **Customers Table**
     - Add UPDATE and DELETE policies for anonymous access
  
  2. **Categories Table**
     - Add UPDATE and DELETE policies for anonymous access
  
  3. **Sales Table**
     - Add UPDATE and DELETE policies for anonymous access
  
  4. **Settings Table**
     - Add DELETE policy for anonymous access
  
  ## Purpose
  Ensure all tables have full CRUD operations available for anonymous users
  so data syncs properly across all devices and browsers.
*/

-- Drop existing policies first to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all to update customers" ON customers;
  DROP POLICY IF EXISTS "Allow all to delete customers" ON customers;
  DROP POLICY IF EXISTS "Allow all to update categories" ON categories;
  DROP POLICY IF EXISTS "Allow all to delete categories" ON categories;
  DROP POLICY IF EXISTS "Allow all to update sales" ON sales;
  DROP POLICY IF EXISTS "Allow all to delete sales" ON sales;
  DROP POLICY IF EXISTS "Allow all to delete settings" ON settings;
  DROP POLICY IF EXISTS "Allow all to delete returns" ON returns;
  DROP POLICY IF EXISTS "Allow all to delete sellers" ON sellers;
END $$;

-- Customers: Add UPDATE and DELETE policies
CREATE POLICY "Allow all to update customers"
  ON customers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete customers"
  ON customers FOR DELETE
  USING (true);

-- Categories: Add UPDATE and DELETE policies
CREATE POLICY "Allow all to update categories"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete categories"
  ON categories FOR DELETE
  USING (true);

-- Sales: Add UPDATE and DELETE policies
CREATE POLICY "Allow all to update sales"
  ON sales FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete sales"
  ON sales FOR DELETE
  USING (true);

-- Settings: Add DELETE policy
CREATE POLICY "Allow all to delete settings"
  ON settings FOR DELETE
  USING (true);

-- Returns: Add DELETE policy
CREATE POLICY "Allow all to delete returns"
  ON returns FOR DELETE
  USING (true);

-- Sellers: Add DELETE policy
CREATE POLICY "Allow all to delete sellers"
  ON sellers FOR DELETE
  USING (true);