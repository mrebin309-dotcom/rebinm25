/*
  # Remove unique constraint on SKU column

  1. Changes
    - Drop the unique constraint on products.sku column
    - This allows multiple products to have the same SKU
  
  2. Notes
    - Products will now be identified primarily by their database ID
    - SKU can be duplicated across multiple products
*/

-- Drop the unique constraint on the sku column
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;