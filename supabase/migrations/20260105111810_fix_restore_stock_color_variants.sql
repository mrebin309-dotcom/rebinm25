/*
  # Fix Stock Restoration to Handle Color Variants

  ## Overview
  Updates the stock restoration trigger to properly handle color variants
  when sales are deleted, ensuring data consistency.

  ## Changes
  1. Updates `restore_product_stock()` function to handle color variants
  2. Function now checks if product has color variants
  3. If color variant exists, restores stock to specific color
  4. Otherwise, restores regular product stock

  ## Security
  - No changes to RLS policies
*/

-- Update function to restore product stock with color variant support
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_uuid UUID;
  current_variants JSONB;
  variant_index INT;
  variant JSONB;
  updated_variants JSONB;
  color_found BOOLEAN := FALSE;
BEGIN
  -- Try to convert product_id to UUID
  BEGIN
    product_uuid := OLD.product_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- If conversion fails (e.g., service sale), log and exit
    RAISE NOTICE 'Invalid UUID format for product_id (might be service): %', OLD.product_id;
    RETURN OLD;
  END;
  
  -- Get current color variants
  SELECT color_variants INTO current_variants
  FROM products
  WHERE id = product_uuid;

  -- If product has color variants and a color was specified in the sale
  IF current_variants IS NOT NULL AND OLD.product_color IS NOT NULL THEN
    updated_variants := '[]'::JSONB;
    
    -- Loop through variants to find and update the matching color
    FOR variant_index IN 0..(jsonb_array_length(current_variants) - 1) LOOP
      variant := current_variants->variant_index;
      
      IF variant->>'color' = OLD.product_color THEN
        -- Restore the stock for this color
        variant := jsonb_set(
          variant,
          '{stock}',
          to_jsonb((variant->>'stock')::INT + OLD.quantity)
        );
        color_found := TRUE;
      END IF;
      
      updated_variants := updated_variants || jsonb_build_array(variant);
    END LOOP;

    -- Update the color variants and total stock
    IF color_found THEN
      UPDATE products
      SET 
        color_variants = updated_variants,
        stock = stock + OLD.quantity
      WHERE id = product_uuid;
      
      RAISE NOTICE 'Restored % units of color % to product %', OLD.quantity, OLD.product_color, product_uuid;
    ELSE
      RAISE NOTICE 'Color % not found in product % variants, restoring to total stock', OLD.product_color, product_uuid;
      -- Color not found, restore to regular stock
      UPDATE products
      SET stock = stock + OLD.quantity
      WHERE id = product_uuid;
    END IF;
  ELSE
    -- No color variants, just restore regular stock
    UPDATE products
    SET stock = stock + OLD.quantity
    WHERE id = product_uuid;
    
    RAISE NOTICE 'Restored % units to product % (no color variants)', OLD.quantity, product_uuid;
  END IF;
  
  -- Check if update happened
  IF NOT FOUND THEN
    RAISE NOTICE 'Product not found with id: %. Stock not restored.', product_uuid;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists (it should already exist from previous migration)
DROP TRIGGER IF EXISTS trigger_restore_stock_on_sale_delete ON sales;
CREATE TRIGGER trigger_restore_stock_on_sale_delete
  AFTER DELETE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_stock();
