/*
  # Fix Seller Breakdown Default Value
  
  ## Changes
  Updates the default value for seller_breakdown to be an empty object instead of an array,
  since the application code uses objects (Record type) for seller breakdowns.
  
  ## Tables Modified
  - `period_history` - Change seller_breakdown default from '[]' to '{}'
*/

-- Update the default value for seller_breakdown
ALTER TABLE period_history 
  ALTER COLUMN seller_breakdown SET DEFAULT '{}'::jsonb;