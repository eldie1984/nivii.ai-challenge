import { Router, Request, Response } from 'express';
import { getDatabase } from '../database/connection';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all transactions for a portfolio
router.get('/portfolio/:portfolioId', asyncHandler(async (req: Request, res: Response) => {
  const { portfolioId } = req.params;
  const userId = req.headers['x-user-id'] as string;

  const db = await getDatabase();
  
  // Verify portfolio ownership
  const portfolioCheck = await db.query(
    'SELECT id FROM portfolio_service.portfolios WHERE id = $1 AND user_id = $2',
    [portfolioId, userId]
  );

  if (portfolioCheck.rows.length === 0) {
    throw createError('Portfolio not found', 404);
  }

  // Get transactions with instrument details
  const result = await db.query(
    `SELECT t.*, i.symbol, i.name, i.type
     FROM transaction_service.transactions t
     JOIN portfolio_service.instruments i ON t.instrument_id = i.id
     WHERE t.portfolio_id = $1
     ORDER BY t.transaction_date DESC`,
    [portfolioId]
  );

  res.json({
    success: true,
    data: result.rows
  });
}));

// Create new transaction with commissions and tariffs
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const {
    portfolioId,
    instrumentId,
    type,
    quantity,
    price,
    brokerCommission = 0,
    exchangeCommission = 0,
    transactionTariff = 0,
    transactionDate,
    notes
  } = req.body;

  if (!portfolioId || !instrumentId || !type || !quantity || !price) {
    throw createError('Missing required fields', 400);
  }

  if (!['buy', 'sell'].includes(type)) {
    throw createError('Invalid transaction type', 400);
  }

  const totalAmount = Math.abs(parseFloat(quantity as string) * parseFloat(price as string));
  const totalFees = brokerCommission + exchangeCommission + transactionTariff;
  const netAmount = totalAmount + totalFees;

  const db = await getDatabase();

  // Verify portfolio ownership
  const portfolioCheck = await db.query(
    'SELECT id FROM portfolio_service.portfolios WHERE id = $1 AND user_id = $2',
    [portfolioId, userId]
  );

  if (portfolioCheck.rows.length === 0) {
    throw createError('Portfolio not found', 404);
  }

  // Create transaction
  const transactionResult = await db.query(
    `INSERT INTO transaction_service.transactions 
     (portfolio_id, instrument_id, type, quantity, price, total_amount, 
      broker_commission, exchange_commission, transaction_tariff, transaction_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [portfolioId, instrumentId, type, quantity, price, totalAmount,
     brokerCommission, exchangeCommission, transactionTariff, transactionDate, notes]
  );

  // Update holdings
  await updateHoldings(db, portfolioId, instrumentId, quantity, price, type, totalAmount);

  res.status(201).json({
    success: true,
    data: {
      transaction: transactionResult.rows[0],
      totalFees,
      netAmount
    }
  });
}));

// Helper function to update holdings
async function updateHoldings(db: any, portfolioId: string, instrumentId: string, 
                           quantity: number, price: number, type: string, totalAmount: number) {
  // Check if holding exists
  const existingHolding = await db.query(
    'SELECT * FROM portfolio_service.holdings WHERE portfolio_id = $1 AND instrument_id = $2',
    [portfolioId, instrumentId]
  );

  if (existingHolding.rows.length > 0) {
    const holding = existingHolding.rows[0];
    let newQuantity, newAverageCost;

    if (type === 'buy') {
      newQuantity = parseFloat(holding.quantity) + quantity;
      const totalCost = (parseFloat(holding.quantity) * parseFloat(holding.average_cost)) + totalAmount;
      newAverageCost = totalCost / newQuantity;
    } else {
      newQuantity = parseFloat(holding.quantity) - Math.abs(quantity);
      newAverageCost = parseFloat(holding.average_cost); // Keep same average cost for sells
    }

    if (newQuantity <= 0) {
      // Remove holding if quantity is zero or negative
      await db.query(
        'DELETE FROM portfolio_service.holdings WHERE portfolio_id = $1 AND instrument_id = $2',
        [portfolioId, instrumentId]
      );
    } else {
      // Update holding
      await db.query(
        `UPDATE portfolio_service.holdings 
         SET quantity = $1, average_cost = $2, updated_at = CURRENT_TIMESTAMP
         WHERE portfolio_id = $3 AND instrument_id = $4`,
        [newQuantity, newAverageCost, portfolioId, instrumentId]
      );
    }
  } else if (type === 'buy') {
    // Create new holding for first purchase
    await db.query(
      `INSERT INTO portfolio_service.holdings 
       (portfolio_id, instrument_id, quantity, average_cost, current_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [portfolioId, instrumentId, quantity, price, price]
    );
  }
}

export { router as transactionRoutes };
