import { Router, Request, Response } from 'express';
import { getDatabase } from '../database/connection';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all portfolios for a user
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    throw createError('User ID required', 400);
  }

  const db = getDatabase();
  const result = await db.query(
    'SELECT * FROM portfolio_service.portfolios WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  res.json({
    success: true,
    data: result.rows
  });
}));

// Create new portfolio
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { name, description } = req.body;

  if (!userId || !name) {
    throw createError('User ID and portfolio name are required', 400);
  }

  const db = getDatabase();
  const result = await db.query(
    `INSERT INTO portfolio_service.portfolios (user_id, name, description) 
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, name, description]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// Get portfolio with holdings
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string;

  const db = getDatabase();
  
  // Get portfolio details
  const portfolioResult = await db.query(
    'SELECT * FROM portfolio_service.portfolios WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (portfolioResult.rows.length === 0) {
    throw createError('Portfolio not found', 404);
  }

  // Get holdings with instrument details
  const holdingsResult = await db.query(
    `SELECT h.*, i.symbol, i.name, i.type, i.exchange, i.currency
     FROM portfolio_service.holdings h
     JOIN portfolio_service.instruments i ON h.instrument_id = i.id
     WHERE h.portfolio_id = $1`,
    [id]
  );

  const portfolio = portfolioResult.rows[0];
  portfolio.holdings = holdingsResult.rows;

  res.json({
    success: true,
    data: portfolio
  });
}));

// Get portfolio performance summary
router.get('/:id/performance', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string;

  const db = getDatabase();
  
  // Verify portfolio ownership
  const portfolioResult = await db.query(
    'SELECT * FROM portfolio_service.portfolios WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (portfolioResult.rows.length === 0) {
    throw createError('Portfolio not found', 404);
  }

  // Get performance metrics
  const performanceResult = await db.query(
    `SELECT 
       COUNT(*) as total_holdings,
       SUM(market_value) as total_market_value,
       SUM(unrealized_pnl) as total_unrealized_pnl
     FROM portfolio_service.holdings 
     WHERE portfolio_id = $1`,
    [id]
  );

  const performance = performanceResult.rows[0];

  res.json({
    success: true,
    data: {
      portfolioId: id,
      totalHoldings: parseInt(performance.total_holdings),
      totalMarketValue: parseFloat(performance.total_market_value) || 0,
      totalUnrealizedPnL: parseFloat(performance.total_unrealized_pnl) || 0,
      totalReturn: performance.total_market_value > 0 
        ? (parseFloat(performance.total_unrealized_pnl) / parseFloat(performance.total_market_value)) * 100 
        : 0
    }
  });
}));

export { router as portfolioRoutes };
