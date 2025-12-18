/*
  # Add Period History and Reset System

  ## Overview
  This migration adds support for periodic reset of cost and profit data.
  - Cost resets on 15th and 30th of each month
  - Profit resets on 30th of each month
  - Historical data is preserved in period_history table

  ## New Tables
  
  ### `period_history`
  Stores archived financial data from each period before reset
  - `id` (uuid, primary key)
  - `period_type` (text) - 'cost' or 'profit'
  - `period_start` (date) - Start date of period
  - `period_end` (date) - End date of period
  - `total_cost` (decimal) - Total cost for the period
  - `total_profit` (decimal) - Total profit for the period
  - `total_sales` (integer) - Number of sales in period
  - `seller_breakdown` (jsonb) - Breakdown by seller
  - `created_at` (timestamptz) - When archive was created

  ### `reset_tracking`
  Tracks when resets occurred
  - `id` (uuid, primary key)
  - `reset_type` (text) - 'cost' or 'profit'
  - `reset_date` (date) - Date of reset
  - `next_reset_date` (date) - Next scheduled reset
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on both tables
  - Anonymous users can read and insert (for reset operations)
*/

-- Create period_history table
CREATE TABLE IF NOT EXISTS period_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type text NOT NULL CHECK (period_type IN ('cost', 'profit')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_cost decimal(10, 2) DEFAULT 0,
  total_profit decimal(10, 2) DEFAULT 0,
  total_sales integer DEFAULT 0,
  seller_breakdown jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create reset_tracking table
CREATE TABLE IF NOT EXISTS reset_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_type text NOT NULL CHECK (reset_type IN ('cost', 'profit')),
  reset_date date NOT NULL,
  next_reset_date date,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE period_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reset_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for period_history (anonymous can read and insert)
CREATE POLICY "Anyone can view period history"
  ON period_history
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert period history"
  ON period_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for reset_tracking (anonymous can read and insert)
CREATE POLICY "Anyone can view reset tracking"
  ON reset_tracking
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert reset tracking"
  ON reset_tracking
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update reset tracking"
  ON reset_tracking
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_period_history_dates ON period_history(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_period_history_type ON period_history(period_type);
CREATE INDEX IF NOT EXISTS idx_reset_tracking_type_date ON reset_tracking(reset_type, reset_date);
