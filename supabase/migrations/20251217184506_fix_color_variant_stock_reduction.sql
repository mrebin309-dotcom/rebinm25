/*
  # Fix Color Variant Stock Reduction

  1. Problem
    - When selling a product with color variants, the specific color's stock doesn't reduce
    - Only the total product stock reduces
    - The trigger `decrease_product_stock` doesn't handle color variants

  2. Solution
    - Update `decrease_product_stock` to check for color variants
    - If product has color variants and a color is specified in the sale:
      - Find the matching color in the JSONB array
      - Reduce that specific color's stock
      - Also reduce the total product stock
    - Update `restore_product_stock` similarly for sale deletions

  3. Changes
    - Replace `decrease_product_stock()` function to handle color variants
    - Replace `restore_product_stock()` function to handle color variants
*/

-- Update the trigger function to handle color variant stock reduction
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_uuid UUID;
  current_stock INTEGER;
  current_variants JSONB;
  variant_index INT;
  variant JSONB;
  updated_variants JSONB;
  color_found BOOLEAN := FALSE;
BEGIN
  -- Try to convert product_id to UUID
  BEGIN
    product_uuid := NEW.product_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- If conversion fails, log and exit
    RAISE NOTICE 'Invalid UUID format for product_id: %', NEW.product_id;
    RETURN NEW;
  END;

  -- Get current color variants
  SELECT color_variants INTO current_variants
  FROM products
  WHERE id = product_uuid;

  -- If product has color variants and a color was specified in the sale
  IF current_variants IS NOT NULL AND NEW.product_color IS NOT NULL THEN
    updated_variants := '[]'::JSONB;
    
    -- Loop through variants to find and update the matching color
    FOR variant_index IN 0..(jsonb_array_length(current_variants) - 1) LOOP
      variant := current_variants->variant_index;
      
      IF variant->>'color' = NEW.product_color THEN
        -- Update the stock for this color
        variant := jsonb_set(
          variant,
          '{stock}',
          to_jsonb(GREATEST(0, (variant->>'stock')::INT - NEW.quantity))
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
        stock = GREATEST(0, stock - NEW.quantity)
      WHERE id = product_uuid;
    ELSE
      RAISE NOTICE 'Color variant not found: % for product: %', NEW.product_color, product_uuid;
    END IF;
  ELSE
    -- No color variants, just reduce regular stock
    UPDATE products
    SET stock = GREATEST(0, stock - NEW.quantity)
    WHERE id = product_uuid;
  END IF;

  -- Check if update happened
  IF NOT FOUND THEN
    RAISE NOTICE 'Product not found with id: %', product_uuid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger function to handle color variant stock restoration
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
    -- If conversion fails, log and exit
    RAISE NOTICE 'Invalid UUID format for product_id: %', OLD.product_id;
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
    ELSE
      RAISE NOTICE 'Color variant not found: % for product: %', OLD.product_color, product_uuid;
    END IF;
  ELSE
    -- No color variants, just restore regular stock
    UPDATE products
    SET stock = stock + OLD.quantity
    WHERE id = product_uuid;
  END IF;

  -- Check if update happened
  IF NOT FOUND THEN
    RAISE NOTICE 'Product not found with id: %', product_uuid;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
