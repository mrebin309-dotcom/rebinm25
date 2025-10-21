/*
  # Add Kurdish Language Categories
  
  1. Changes
    - Adds Kurdish translations for product categories
    - Provides default categories in Kurdish (کوردی)
  
  2. New Categories (Kurdish)
    - ئەلیکترۆنیات (Electronics)
    - جل و بەرگ (Clothing)
    - خواردن و خواردنەوە (Food & Beverage)
    - ماڵ و باخچە (Home & Garden)
    - کتێب (Books)
    - یاریکردن (Toys)
    - وەرزش (Sports)
    - تەندروستی و جوانی (Health & Beauty)
    - ئۆتۆمبێل (Automotive)
    - پێداویستی ئۆفیس (Office Supplies)
*/

INSERT INTO categories (name, description) VALUES
  ('ئەلیکترۆنیات', 'ئامێرە ئەلیکترۆنیەکان و پێداویستییەکان'),
  ('جل و بەرگ', 'جلوبەرگ و شتە مۆدێلەکان'),
  ('خواردن و خواردنەوە', 'بەرهەمە خۆراکی و خواردنەوەکان'),
  ('ماڵ و باخچە', 'پێداویستی باشترکردنی ماڵ و باخچە'),
  ('کتێب', 'کتێب و بڵاوکراوەکان'),
  ('یاریکردن', 'یاری و یارمەتییەکانی یاری'),
  ('وەرزش', 'ئامێر و پێداویستی وەرزش'),
  ('تەندروستی و جوانی', 'بەرهەمی تەندروستی و جوانی'),
  ('ئۆتۆمبێل', 'پارچە و پێداویستی ئۆتۆمبێل'),
  ('پێداویستی ئۆفیس', 'پێداویستی ئۆفیس و قوتابخانە')
ON CONFLICT (name) DO NOTHING;
