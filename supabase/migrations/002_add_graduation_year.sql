-- Add graduation_year column and remove grade column
-- Migration: 002_add_graduation_year.sql

-- Add graduation_year column (integer, nullable)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Remove the grade column
ALTER TABLE profiles 
DROP COLUMN IF EXISTS grade; 