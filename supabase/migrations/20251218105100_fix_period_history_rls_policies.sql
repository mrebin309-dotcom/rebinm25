/*
  # Fix Period History RLS Policies
  
  ## Changes
  Updates RLS policies for period_history and reset_tracking tables to work for all users, not just anonymous.
  
  ## Security
  - Adds policies for authenticated users
  - Adds policies for public access
  - Ensures both anonymous and authenticated users can insert and read
  
  ## Tables Modified
  - `period_history` - Add authenticated and public policies
  - `reset_tracking` - Add authenticated and public policies
*/

-- Drop existing anon-only policies
DROP POLICY IF EXISTS "Anyone can view period history" ON period_history;
DROP POLICY IF EXISTS "Anyone can insert period history" ON period_history;
DROP POLICY IF EXISTS "Anyone can view reset tracking" ON reset_tracking;
DROP POLICY IF EXISTS "Anyone can insert reset tracking" ON reset_tracking;
DROP POLICY IF EXISTS "Anyone can update reset tracking" ON reset_tracking;

-- Create new policies for period_history that work for everyone
CREATE POLICY "Public can view period history"
  ON period_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert period history"
  ON period_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create new policies for reset_tracking that work for everyone
CREATE POLICY "Public can view reset tracking"
  ON reset_tracking
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert reset tracking"
  ON reset_tracking
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update reset tracking"
  ON reset_tracking
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);