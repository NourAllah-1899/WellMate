import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateDatabase = async () => {
    try {
        console.log('Connecting to database...');
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'WellMate',
        });

        console.log('Adding "role" column if it does not exist...');
        try {
            await pool.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER email;");
            console.log('✅ Column "role" added successfully.');
        } catch (err) {
            // Error 1060: Duplicate column name
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column "role" already exists.');
            } else {
                throw err;
            }
        }

        console.log('Promoting ALL current users to admin for testing purposes...');
        await pool.query("UPDATE users SET role = 'admin'");
        console.log('✅ All users are now admins!');

        console.log('\n🎉 Database setup for Admin Panel complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating database:', err);
        process.exit(1);
    }
};

updateDatabase();
