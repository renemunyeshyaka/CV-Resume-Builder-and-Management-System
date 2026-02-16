-- Migration: Add new profile fields to users table
-- Run this if you have an existing database

-- Add phone column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add location column
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add occupation column
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);

-- Add bio column
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.phone IS 'User phone number';
COMMENT ON COLUMN users.location IS 'User location/address';
COMMENT ON COLUMN users.occupation IS 'User current occupation/job title';
COMMENT ON COLUMN users.bio IS 'User professional biography';

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('phone', 'location', 'occupation', 'bio');
