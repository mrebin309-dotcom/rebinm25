/*
  # Fix Inventory Reduction Trigger
  
  1. Problem
    - product_id in sales table is TEXT while products.id is UUID
    - Trigger needs better handling of text-to-uuid conversion
    
  2. Solution
    - Improve the trigger function to handle text product_id properly
    - Add better error handling and validation
    
  3. Security
    - No changes to RLS policies
*/

-- Drop and recreate the trigger function with improved logic
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_uuid UUID;
  current_stock INTEGER;
BEGIN
  -- Try to convert product_id to UUID
  BEGIN
    product_uuid := NEW.product_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- If conversion fails, log and exit
    RAISE NOTICE 'Invalid UUID format for product_id: %', NEW.product_id;
    RETURN NEW;
  END;
  
  -- Get current stock and update in one query to avoid race conditions
  UPDATE products
  SET stock = GREATEST(0, stock - NEW.quantity)
  WHERE id = product_uuid;
  
  -- Check if update happened
  IF NOT FOUND THEN
    RAISE NOTICE 'Product not found with id: %', product_uuid;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trigger_decrease_stock_on_sale ON sales;
CREATE TRIGGER trigger_decrease_stock_on_sale
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION decrease_product_stock();
