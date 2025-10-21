/*
  # Add Category Column to Sales Table

  1. Changes
    - Add `product_category` column to `sales` table to store the category at the time of sale
    - This allows historical tracking of category-based sales data
    
  2. Notes
    - Column is nullable to maintain compatibility with existing data
    - Future sales will populate this field automatically
    - Handles both UUID and non-UUID product_ids (like services)
*/

-- Add category column to sales table
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS product_category text;

-- Update existing sales with category from products table (where product_id is a valid UUID)
UPDATE sales s
SET product_category = p.category
FROM products p
WHERE s.product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND s.product_id::uuid = p.id
  AND s.product_category IS NULL;

-- Set category to 'Service' for non-UUID product_ids
UPDATE sales
SET product_category = 'Service'
WHERE product_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND product_category IS NULL;
