/*
  # Update existing sales with unit_cost
  
  This migration updates existing sales records that have missing or zero unit_cost values
  by setting them to the current product cost. This is a one-time fix for existing data.
  
  1. Updates
    - Sets unit_cost for sales where unit_cost is 0 or NULL
    - Uses the product's current cost as the unit_cost
*/

-- Update existing sales with missing unit_cost
UPDATE sales s
SET unit_cost = COALESCE(
  (SELECT cost FROM products p WHERE p.id::text = s.product_id),
  0
)
WHERE s.unit_cost IS NULL OR s.unit_cost = 0;
