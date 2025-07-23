-- Add graduation_year column and remove grade column
-- Migration: 002_add_graduation_year.sql

-- Add graduation_year column (integer, nullable)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Remove the grade column
ALTER TABLE profiles 
DROP COLUMN IF EXISTS grade; 

-- Add chatbot_messages column to existing documents table if not exists
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS chatbot_messages JSONB DEFAULT '[]';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_chatbot_messages ON documents USING GIN (chatbot_messages);