/*
  # Add Default Categories

  1. Changes
    - Inserts default product categories if none exist
    - Categories include: Electronics, OLED, LCD, Accessories, Parts, Other

  2. Notes
    - Uses ON CONFLICT to prevent duplicates
    - Only adds categories if they don't already exist
*/

INSERT INTO categories (name, description)
VALUES 
  ('Electronics', 'Electronic devices and components'),
  ('OLED', 'OLED displays and screens'),
  ('LCD', 'LCD displays and screens'),
  ('Accessories', 'Phone and device accessories'),
  ('Parts', 'Replacement parts and components'),
  ('Other', 'Miscellaneous items')
ON CONFLICT (name) DO NOTHING;