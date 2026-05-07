import { Pool } from 'pg';
import { config } from '../config';

let pool: Pool;

export const connectDatabase = async (): Promise<Pool> => {
  if (!pool) {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
    });
  }
  return pool;
};

export const getDatabase = async () => {
  if (!pool) {
    await connectDatabase();
  }
  return pool;
};
