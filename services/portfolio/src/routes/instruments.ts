import { Router, Request, Response } from 'express';
import { getDatabase } from '../database/connection';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all instruments
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { type, exchange } = req.query;
  
  let query = 'SELECT * FROM portfolio_service.instruments WHERE is_active = true';
  const params: any[] = [];
  
  if (type) {
    query += ' AND type = $' + (params.length + 1);
    params.push(type);
  }
  
  if (exchange) {
    query += ' AND exchange = $' + (params.length + 1);
    params.push(exchange);
  }
  
  query += ' ORDER BY symbol';

  const db = getDatabase();
  const result = await db.query(query, params);

  res.json({
    success: true,
    data: result.rows
  });
}));

// Create new instrument
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { symbol, name, type, exchange, currency } = req.body;

  if (!symbol || !name || !type) {
    throw createError('Symbol, name, and type are required', 400);
  }

  const validTypes = ['stock', 'option', 'bond', 'crypto', 'etf', 'loan', 'block_shares'];
  if (!validTypes.includes(type)) {
    throw createError('Invalid instrument type', 400);
  }

  const db = getDatabase();
  const result = await db.query(
    `INSERT INTO portfolio_service.instruments (symbol, name, type, exchange, currency) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [symbol, name, type, exchange || null, currency || 'USD']
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// Get instrument by symbol
router.get('/symbol/:symbol', asyncHandler(async (req: Request, res: Response) => {
  const { symbol } = req.params;

  const db = getDatabase();
  const result = await db.query(
    'SELECT * FROM portfolio_service.instruments WHERE symbol = $1 AND is_active = true',
    [symbol]
  );

  if (result.rows.length === 0) {
    throw createError('Instrument not found', 404);
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

export { router as instrumentRoutes };
