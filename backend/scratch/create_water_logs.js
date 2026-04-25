import pool from '../src/config/db.js';

async function run() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS water_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                glasses_count INT NOT NULL DEFAULT 0,
                log_date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY user_date_water (user_id, log_date)
            )
        `);
        console.log('Water logs table created successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
run();
