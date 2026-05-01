import pool from './src/config/db.js';

async function check() {
    try {
        const [rows] = await pool.query('SHOW COLUMNS FROM events');
        console.log('Events Columns:', rows.map(r => r.Field));
        
        const [users] = await pool.query('SHOW COLUMNS FROM users');
        console.log('Users Columns:', users.map(r => r.Field));

        const [participants] = await pool.query('SHOW COLUMNS FROM event_participants');
        console.log('Participants Columns:', participants.map(r => r.Field));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
