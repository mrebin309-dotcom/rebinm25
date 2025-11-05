/*
  # Add Color Variants Support for Products

  1. Changes to `products` table
    - Add `color_variants` column (JSONB) to store color variant information
    - Each variant includes: color name, color code (hex), and stock quantity

  2. Changes to `sales` table
    - Add `product_color` column (text) to track which color was sold

  3. Notes
    - Color variants are optional and primarily for "Back Glass" category
    - When color variants exist, individual color stock is tracked
    - Total product stock remains as sum of all color variant stocks
*/

-- Add color_variants column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'color_variants'
  ) THEN
    ALTER TABLE products ADD COLUMN color_variants JSONB DEFAULT NULL;
  END IF;
END $$;

-- Add product_color column to sales table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'product_color'
  ) THEN
    ALTER TABLE sales ADD COLUMN product_color TEXT DEFAULT NULL;
  END IF;
END $$;

-- Create index on color_variants for faster queries
CREATE INDEX IF NOT EXISTS idx_products_color_variants ON products USING GIN (color_variants);

-- Update the trigger to handle color variant stock reduction
CREATE OR REPLACE FUNCTION reduce_inventory_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  current_variants JSONB;
  variant_index INT;
  variant JSONB;
  updated_variants JSONB;
  color_found BOOLEAN := FALSE;
BEGIN
  -- Get current color variants
  SELECT color_variants INTO current_variants
  FROM products
  WHERE id = NEW.product_id;

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
          to_jsonb((variant->>'stock')::INT - NEW.quantity)
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
        stock = stock - NEW.quantity
      WHERE id = NEW.product_id;
    END IF;
  ELSE
    -- No color variants, just reduce regular stock
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger to handle color variant stock restoration on sale deletion
CREATE OR REPLACE FUNCTION restore_inventory_on_sale_delete()
RETURNS TRIGGER AS $$
DECLARE
  current_variants JSONB;
  variant_index INT;
  variant JSONB;
  updated_variants JSONB;
  color_found BOOLEAN := FALSE;
BEGIN
  -- Get current color variants
  SELECT color_variants INTO current_variants
  FROM products
  WHERE id = OLD.product_id;

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
      WHERE id = OLD.product_id;
    END IF;
  ELSE
    -- No color variants, just restore regular stock
    UPDATE products
    SET stock = stock + OLD.quantity
    WHERE id = OLD.product_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;