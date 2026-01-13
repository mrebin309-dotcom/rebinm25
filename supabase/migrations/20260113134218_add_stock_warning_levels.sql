/*
  # Add Stock Warning Level Options

  1. Changes
    - Replace `stock_warnings_enabled` boolean with `stock_warning_level` text field
    - Support three levels: 'all' (default), 'out_only', 'disabled'
    
  2. Migration Strategy
    - Add new column with default 'all'
    - Migrate existing data: false -> 'disabled', true/null -> 'all'
    - Drop old column
    
  3. Notes
    - 'all': Show both low stock and out of stock warnings
    - 'out_only': Only show out of stock warnings (not low stock)
    - 'disabled': No warnings at all
*/

-- Add new column with default 'all'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_warning_level'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_warning_level text DEFAULT 'all' CHECK (stock_warning_level IN ('all', 'out_only', 'disabled'));
  END IF;
END $$;

-- Migrate existing data from stock_warnings_enabled to stock_warning_level
UPDATE products
SET stock_warning_level = CASE
  WHEN stock_warnings_enabled = false THEN 'disabled'
  ELSE 'all'
END
WHERE stock_warning_level = 'all';

-- Drop old column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_warnings_enabled'
  ) THEN
    ALTER TABLE products DROP COLUMN stock_warnings_enabled;
  END IF;
END $$;