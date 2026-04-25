-- Calorie Goal Fields for Users
ALTER TABLE users ADD COLUMN calorie_goal INT DEFAULT 2000;
ALTER TABLE users ADD COLUMN goal_type ENUM('lose', 'gain', 'maintain') DEFAULT 'maintain';

-- Smoking Logs Table
CREATE TABLE IF NOT EXISTS smoking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cigarettes_count INT NOT NULL DEFAULT 0,
    log_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY user_date_smoking (user_id, log_date)
);

-- AI Reports Table
CREATE TABLE IF NOT EXISTS health_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
    content TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
