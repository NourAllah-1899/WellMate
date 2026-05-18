-- Sprint 7: Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user' AFTER email;

-- Create an admin account (password: Admin@123)
-- You can update an existing user to admin with:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@wellmate.com';
