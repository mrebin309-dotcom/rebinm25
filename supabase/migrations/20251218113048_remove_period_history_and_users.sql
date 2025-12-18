/*
  # Remove Period History and User Management Tables

  ## Changes Made

  1. Drop Tables
    - Drop `period_history` table
    - Drop `reset_tracking` table
    - Drop `users` table (if exists)

  2. Clean Up
    - Remove all related indexes
    - Remove all related policies
    - Remove all related triggers
*/

-- Drop tables if they exist
DROP TABLE IF EXISTS period_history CASCADE;
DROP TABLE IF EXISTS reset_tracking CASCADE;
DROP TABLE IF EXISTS users CASCADE;
