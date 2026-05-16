-- migrations/20240514_create_badges_and_user_badges.sql

CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  criteria_type ENUM('smoke_free_days','sport_sessions','step_goal') NOT NULL,
  criteria_value INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_badge (user_id, badge_id)
);

-- Add streak columns to users table (optional) if not present
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS streak_start DATE NULL,
  ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
