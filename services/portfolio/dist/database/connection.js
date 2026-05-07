"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.getDatabase = getDatabase;
const pg_1 = require("pg");
const config_1 = require("../config");
let pool;
async function connectDatabase() {
    try {
        pool = new pg_1.Pool({
            connectionString: config_1.config.DATABASE_URL,
            ssl: config_1.config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('Portfolio Service: Database connected successfully');
    }
    catch (error) {
        console.error('Portfolio Service: Database connection failed:', error);
        throw error;
    }
}
function getDatabase() {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDatabase() first.');
    }
    return pool;
}
//# sourceMappingURL=connection.js.map