/*
  # Add Stock Warnings Toggle to Products

  ## Changes
  1. Add `stock_warnings_enabled` column to products table
    - Boolean field to control whether stock warnings are shown for each product
    - Defaults to `true` (warnings enabled by default for existing products)
  
  ## Notes
  - Allows users to selectively enable/disable low stock warnings per product
  - Existing products will have warnings enabled by default for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_warnings_enabled'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_warnings_enabled boolean DEFAULT true NOT NULL;
  END IF;
END $$;
