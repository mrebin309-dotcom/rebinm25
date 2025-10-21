/*
  # Add Stock Restoration on Sale Deletion

  1. Purpose
    - When a sale is deleted, automatically restore the product stock
    - Ensure data consistency across all reports and statistics
    
  2. New Function
    - `restore_product_stock()` - Restores product stock when sale is deleted
    
  3. New Trigger
    - `trigger_restore_stock_on_sale_delete` - Fires when a sale is deleted
    
  4. Updates to Seller Statistics
    - Seller statistics are automatically recalculated via existing triggers
    
  5. Security
    - No changes to RLS policies
*/

-- Create function to restore product stock when sale is deleted
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_uuid UUID;
BEGIN
  -- Try to convert product_id to UUID
  BEGIN
    product_uuid := OLD.product_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- If conversion fails (e.g., service sale), log and exit
    RAISE NOTICE 'Invalid UUID format for product_id (might be service): %', OLD.product_id;
    RETURN OLD;
  END;
  
  -- Restore stock to the product
  UPDATE products
  SET stock = stock + OLD.quantity
  WHERE id = product_uuid;
  
  -- Check if update happened
  IF NOT FOUND THEN
    RAISE NOTICE 'Product not found with id: %. Stock not restored.', product_uuid;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires when a sale is deleted
DROP TRIGGER IF EXISTS trigger_restore_stock_on_sale_delete ON sales;
CREATE TRIGGER trigger_restore_stock_on_sale_delete
  AFTER DELETE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_stock();
