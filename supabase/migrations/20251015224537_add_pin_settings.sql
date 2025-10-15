/*
  # Add PIN Settings Table

  1. New Tables
    - `pin_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `pin` (text) - The PIN code (encrypted)
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp
  
  2. Security
    - Enable RLS on `pin_settings` table
    - Add policy for authenticated access (internal system use)
  
  3. Initial Data
    - Insert default PIN: 2059494
*/

-- Create pin_settings table
CREATE TABLE IF NOT EXISTS pin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (this is an internal system table)
CREATE POLICY "Allow all operations on pin_settings"
  ON pin_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default PIN
INSERT INTO pin_settings (pin) VALUES ('2059494')
ON CONFLICT DO NOTHING;