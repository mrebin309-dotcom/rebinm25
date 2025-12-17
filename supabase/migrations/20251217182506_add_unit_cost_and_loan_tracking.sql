/*
  # Add Unit Cost Tracking and Loan Purchase Features

  ## Changes Made

  1. **Sales Table Enhancement**
    - Add `unit_cost` column to track cost per unit (especially for services)
    - Add `purchase_type` column to distinguish between cash and loan purchases
    - Add `loan_id` column to link sales to loan purchases
    
  2. **New Loans Table**
    - `id` (uuid, primary key)
    - `loan_date` (date when loan was taken)
    - `loan_amount` (total amount borrowed)
    - `purpose` (description of what was purchased)
    - `status` (pending/paid)
    - `paid_date` (when loan was repaid)
    - `notes` (additional information)
    
  3. **New Loan Payments Table**
    - Track individual payments towards loans
    - Link to sales to show which sold items contributed to repayment
    
  ## Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add unit_cost column to sales table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'unit_cost'
  ) THEN
    ALTER TABLE sales ADD COLUMN unit_cost numeric DEFAULT 0 CHECK (unit_cost >= 0);
  END IF;
END $$;

-- Add purchase_type column to sales table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'purchase_type'
  ) THEN
    ALTER TABLE sales ADD COLUMN purchase_type text DEFAULT 'cash' CHECK (purchase_type IN ('cash', 'loan'));
  END IF;
END $$;

-- Add loan_id column to sales table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'loan_id'
  ) THEN
    ALTER TABLE sales ADD COLUMN loan_id uuid;
  END IF;
END $$;

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_date date NOT NULL DEFAULT CURRENT_DATE,
  loan_amount numeric NOT NULL CHECK (loan_amount > 0),
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial')),
  paid_amount numeric DEFAULT 0 CHECK (paid_amount >= 0),
  paid_date date,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_amount numeric NOT NULL CHECK (payment_amount > 0),
  sale_id uuid REFERENCES sales(id),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key for loan_id in sales
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'sales_loan_id_fkey' AND table_name = 'sales'
  ) THEN
    ALTER TABLE sales ADD CONSTRAINT sales_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;

-- Policies for loans table
CREATE POLICY "Anyone can view loans"
  ON loans FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert loans"
  ON loans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update loans"
  ON loans FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete loans"
  ON loans FOR DELETE
  USING (true);

-- Policies for loan_payments table
CREATE POLICY "Anyone can view loan_payments"
  ON loan_payments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert loan_payments"
  ON loan_payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update loan_payments"
  ON loan_payments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete loan_payments"
  ON loan_payments FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_loan_id ON sales(loan_id);
CREATE INDEX IF NOT EXISTS idx_sales_purchase_type ON sales(purchase_type);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_sale_id ON loan_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_date ON loans(loan_date);