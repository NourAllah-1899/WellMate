import mysql from 'mysql2/promise';

const pool = (process.env.NODE_ENV === 'test')
    ? {
        query: (...args) => {
            if (!globalThis.__mockPool?.query) {
                throw new Error('Test DB mock not configured (globalThis.__mockPool.query missing).');
            }
            return globalThis.__mockPool.query(...args);
        },
    }
    : mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'WellMate',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

export default pool;
