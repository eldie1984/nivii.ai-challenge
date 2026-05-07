import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '3004', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/portfolio_tracker',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
};
