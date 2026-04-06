-- Add language preference to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_language ON users(language);
