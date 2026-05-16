import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const sqlPath = path.join(__dirname, '../src/migrations/20240514_create_badges_and_user_badges.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split the SQL script into individual statements
  const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

  for (const stmt of statements) {
    try {
      console.log(`Executing: ${stmt.substring(0, 50)}...`);
      await pool.query(stmt);
      console.log('Success.');
    } catch (err) {
      console.error('Error executing statement:', err);
      process.exit(1);
    }
  }
  console.log('Migration completed.');
  process.exit(0);
}

runMigration();
