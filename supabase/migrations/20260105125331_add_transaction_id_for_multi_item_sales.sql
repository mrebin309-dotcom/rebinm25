/*
  # Add Transaction ID for Multi-Item Sales
  
  1. Changes
    - Add `transaction_id` column to sales table to group multiple items sold together
    - Add index on transaction_id for faster grouping queries
    - Generate unique transaction IDs for existing sales
    
  2. Notes
    - Allows selling multiple products from different categories in one transaction
    - Each product still gets its own row but they're linked by transaction_id
    - Useful for reports and tracking complete orders
*/

-- Add transaction_id column to sales table
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS transaction_id UUID DEFAULT gen_random_uuid();

-- Create index for faster transaction queries
CREATE INDEX IF NOT EXISTS idx_sales_transaction_id ON sales(transaction_id);

-- Update existing sales to have unique transaction_ids (each sale is its own transaction)
UPDATE sales 
SET transaction_id = gen_random_uuid() 
WHERE transaction_id IS NULL;

-- Make transaction_id not null after backfilling
ALTER TABLE sales 
ALTER COLUMN transaction_id SET NOT NULL;
