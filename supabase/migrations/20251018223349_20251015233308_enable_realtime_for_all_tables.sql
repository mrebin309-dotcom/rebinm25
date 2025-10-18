/*
  # Enable Realtime for All Tables

  ## Changes Made
  
  Enable realtime replication for all main tables so data syncs
  instantly across all devices and browsers.
  
  Tables enabled:
  - products
  - sales
  - returns
  - customers
  - categories
  - sellers
  - settings
  
  ## Purpose
  This ensures any changes made on one device/browser are immediately
  visible on all other connected devices.
*/

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable realtime for sales
ALTER PUBLICATION supabase_realtime ADD TABLE sales;

-- Enable realtime for returns
ALTER PUBLICATION supabase_realtime ADD TABLE returns;

-- Enable realtime for customers
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- Enable realtime for categories
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- Enable realtime for sellers
ALTER PUBLICATION supabase_realtime ADD TABLE sellers;

-- Enable realtime for settings
ALTER PUBLICATION supabase_realtime ADD TABLE settings;