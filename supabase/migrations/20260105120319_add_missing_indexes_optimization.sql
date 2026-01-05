/*
  # Database Performance Optimization
  
  1. Performance Improvements
    - Add missing index on returns.sale_id foreign key for faster lookups
    - Add composite index on sales(seller_id, created_at) for seller reports
    - Add index on products.name for faster text searches
    - Add index on sales.product_category for filtering
    
  2. Notes
    - These indexes will significantly improve query performance for reports and searches
    - Composite indexes help with common query patterns (seller reports by date)
*/

-- Add missing index on returns.sale_id (foreign key should always be indexed)
CREATE INDEX IF NOT EXISTS idx_returns_sale_id ON returns(sale_id);

-- Add composite index for seller reports with date filtering
CREATE INDEX IF NOT EXISTS idx_sales_seller_created ON sales(seller_id, created_at DESC);

-- Add simple btree index on product names for faster search
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Add index on product category in sales for filtering
CREATE INDEX IF NOT EXISTS idx_sales_product_category ON sales(product_category);

-- Add partial index on completed sales for reporting
CREATE INDEX IF NOT EXISTS idx_sales_completed_date ON sales(created_at DESC) WHERE status = 'completed';
