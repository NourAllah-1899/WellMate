import mysql from 'mysql2/promise';
import 'dotenv/config';

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'WellMate',
    });

    try {
        console.log('--- Sprint 5 Migration Started ---');

        // Add calorie_goal if not exists
        const [cols] = await connection.execute("SHOW COLUMNS FROM users LIKE 'calorie_goal'");
        if (cols.length === 0) {
            await connection.execute("ALTER TABLE users ADD COLUMN calorie_goal INT DEFAULT 2000");
            console.log('Added calorie_goal to users');
        }

        const [cols2] = await connection.execute("SHOW COLUMNS FROM users LIKE 'goal_type'");
        if (cols2.length === 0) {
            await connection.execute("ALTER TABLE users ADD COLUMN goal_type ENUM('lose', 'gain', 'maintain') DEFAULT 'maintain'");
            console.log('Added goal_type to users');
        }

        // Create smoking_logs
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS smoking_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                cigarettes_count INT NOT NULL DEFAULT 0,
                log_date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY user_date_smoking (user_id, log_date)
            )
        `);
        console.log('Verified smoking_logs table');

        // Create health_reports
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS health_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                report_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
                content TEXT NOT NULL,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Verified health_reports table');

        console.log('--- Migration Completed Successfully ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

runMigration();
