import pool from '../src/config/db.js';

async function migrate() {
    try {
        console.log('Adding UNIQUE constraint to smoking_logs...');
        await pool.query('ALTER TABLE smoking_logs ADD UNIQUE (user_id, log_date)');
        console.log('Successfully added UNIQUE constraint.');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.log('Unique constraint already exists or there are duplicate entries.');
            // If there are duplicates, we might need to merge them first.
        } else if (err.code === 'ER_DUP_KEYNAME') {
            console.log('Constraint already exists.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
