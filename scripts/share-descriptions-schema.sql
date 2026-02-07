-- Add share_description_index to wills table
-- This stores which description variant to use for OG meta tags
ALTER TABLE wills ADD COLUMN IF NOT EXISTS share_description_index INTEGER DEFAULT 0;

-- Update existing wills with random description indices (0-9 for 10 descriptions)
UPDATE wills SET share_description_index = floor(random() * 10)::integer WHERE share_description_index = 0 OR share_description_index IS NULL;
