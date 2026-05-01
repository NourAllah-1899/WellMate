import pool from '../src/config/db.js';

async function checkDuplicates() {
    try {
        const [rows] = await pool.query(`
            SELECT user_id, log_date, COUNT(*) as count, SUM(cigarettes_count) as total
            FROM smoking_logs
            GROUP BY user_id, log_date
            HAVING count > 1
        `);
        console.log('Duplicates found:', rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        process.exit();
    }
}

checkDuplicates();
