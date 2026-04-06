import pool from './src/config/db.js';
import fs from 'fs';

async function fix() {
    try {
        console.log('Applying DB fixes...');
        await pool.query(`CREATE TABLE IF NOT EXISTS health_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight_kg DECIMAL(5,2),
    heart_rate INT,
    blood_pressure VARCHAR(20),
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_recorded_date (recorded_date)
);`);
        console.log('health_logs created');

        await pool.query(`CREATE TABLE IF NOT EXISTS health_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    description TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_recorded_at (recorded_at)
);`);
        console.log('health_events created');

    } catch(err) {
        console.log("Error creating tables:", err.message);
    }
    
    // the sprint4 tables
    try {
        const sqlSprint4 = fs.readFileSync('sprint4-tables.sql', 'utf8');
        const queries = sqlSprint4.split(';');
        for(let q of queries) {
            if (q.trim().length > 0) {
                await pool.query(q);
            }
        }
        console.log('Sprint 4 tables created');
    } catch(err) {
        console.log("Error sprint4:", err.message);
    }

    try {
        await pool.query('ALTER TABLE meals CHANGE meal_name description VARCHAR(255) NOT NULL;');
        console.log('meal_name changed to description');
    } catch(e) { } // Ignore if already changed

    console.log('Done!');
    process.exit(0);
}

fix();
