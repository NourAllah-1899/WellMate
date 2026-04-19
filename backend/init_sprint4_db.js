import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'sprint4-tables.sql'), 'utf-8');
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('Sprint 4 tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

run();
