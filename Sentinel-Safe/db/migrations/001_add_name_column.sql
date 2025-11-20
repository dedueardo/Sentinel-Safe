-- Ensure schema matches backend expectations
USE sentinel_safe;

-- Add 'name' column if missing and backfill from 'username' when present
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(100)
AFTER id;

UPDATE users
SET
    name = COALESCE(name, username, '')
WHERE
    name IS NULL
    OR name = '';

-- Drop legacy 'username' column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS username;