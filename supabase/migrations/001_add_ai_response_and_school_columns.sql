-- Add latest_ai_response column to document_versions table
ALTER TABLE document_versions 
ADD COLUMN latest_ai_response TEXT;

-- Add school column to documents table with default value and NOT NULL constraint
ALTER TABLE documents 
ADD COLUMN school TEXT NOT NULL DEFAULT 'Uncategorized';

-- Add check constraint to ensure school has at least 1 character
ALTER TABLE documents 
ADD CONSTRAINT check_school_length CHECK (LENGTH(TRIM(school)) >= 1);
