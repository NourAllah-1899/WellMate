import pool from '../src/config/db.js';

async function mergeDuplicates() {
    try {
        console.log('Merging duplicates in smoking_logs...');
        
        // 1. Get all duplicates
        const [duplicates] = await pool.query(`
            SELECT user_id, log_date, SUM(cigarettes_count) as total
            FROM smoking_logs
            GROUP BY user_id, log_date
            HAVING COUNT(*) > 1
        `);

        for (const dup of duplicates) {
            const { user_id, log_date, total } = dup;
            // Format date for query if needed, but the object should work
            
            console.log(`Merging ${total} cigarettes for user ${user_id} on ${log_date}`);
            
            // Delete all entries for this user/date
            await pool.query('DELETE FROM smoking_logs WHERE user_id = ? AND log_date = ?', [user_id, log_date]);
            
            // Insert a single merged entry
            await pool.query('INSERT INTO smoking_logs (user_id, log_date, cigarettes_count) VALUES (?, ?, ?)', [user_id, log_date, total]);
        }

        console.log('Merging complete.');
        
        // 2. Now add the UNIQUE constraint
        console.log('Adding UNIQUE constraint...');
        await pool.query('ALTER TABLE smoking_logs ADD UNIQUE (user_id, log_date)');
        console.log('Success.');

    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        process.exit();
    }
}

mergeDuplicates();
