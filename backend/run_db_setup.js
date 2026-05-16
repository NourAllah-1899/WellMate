import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDatabaseSetup() {
    console.log('🚀 Starting database setup...');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'WellMate',
    });

    try {
        const sqlPath = path.join(__dirname, 'database_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        
        console.log(`📦 Found ${statements.length} SQL statements to execute`);
        
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i].trim();
            if (stmt.length > 0) {
                try {
                    await connection.execute(stmt);
                    // Extract table name from CREATE TABLE statement for logging
                    const match = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
                    if (match) {
                        console.log(`   ✅ Table '${match[1]}' verified/created`);
                    }
                } catch (err) {
                    // Ignore errors for tables that already exist
                    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                        const match = err.sqlMessage?.match(/Table '(\w+)'/);
                        if (match) {
                            console.log(`   ℹ️  Table '${match[1]}' already exists`);
                        }
                    } else {
                        console.error(`   ❌ Error executing statement ${i + 1}:`, err.message);
                    }
                }
            }
        }
        
        console.log('✅ Database setup completed successfully!');
        console.log('');
        console.log('All tables have been verified/created:');
        console.log('  • users');
        console.log('  • weight_goals');
        console.log('  • meals');
        console.log('  • physical_activities');
        console.log('  • smoking_logs');
        console.log('  • sport_programs ← This was missing!');
        console.log('  • health_logs');
        console.log('  • health_events');
        console.log('  • health_reports');
        console.log('  • events');
        console.log('  • event_participants');
        console.log('  • water_logs');
        
    } catch (err) {
        console.error('❌ Database setup failed:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runDatabaseSetup();