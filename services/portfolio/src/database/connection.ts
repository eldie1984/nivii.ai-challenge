import { Pool } from 'pg';
import { config } from '../config';

let pool: Pool;

export async function connectDatabase(): Promise<void> {
  try {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('Portfolio Service: Database connected successfully');
  } catch (error) {
    console.error('Portfolio Service: Database connection failed:', error);
    throw error;
  }
}

export function getDatabase(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
}
