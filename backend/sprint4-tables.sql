-- Sprint 4: Physical Activity & Habits Tracking
-- Copy and paste these 3 tables into phpMyAdmin or MySQL

-- Table 1: Physical Activities
CREATE TABLE IF NOT EXISTS physical_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    intensity VARCHAR(20) NOT NULL,
    calories_burned INT,
    activity_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_date (activity_date)
);

-- Table 2: Smoking Logs
CREATE TABLE IF NOT EXISTS smoking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cigarettes_count INT NOT NULL,
    quit_target_date DATE,
    days_without_smoking INT DEFAULT 0,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_log_date (log_date)
);

-- Table 3: Sport Programs
CREATE TABLE IF NOT EXISTS sport_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    target_objective VARCHAR(255),
    weekly_sessions INT,
    session_duration_minutes INT,
    exercises TEXT,
    recommendations TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);
