import pool from './src/config/db.js';

async function fix() {
    try {
        console.log('Dropping old tables...');
        await pool.query('DROP TABLE IF EXISTS event_participants');
        await pool.query('DROP TABLE IF EXISTS events');

        console.log('Creating new events table...');
        await pool.query(`
            CREATE TABLE events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                activity_type VARCHAR(50) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                time TIME NOT NULL,
                latitude DOUBLE NOT NULL,
                longitude DOUBLE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('Creating new event_participants table...');
        await pool.query(`
            CREATE TABLE event_participants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_id INT NOT NULL,
                user_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY user_event_join (user_id, event_id),
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('Fix completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
}

fix();
