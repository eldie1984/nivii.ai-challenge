"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioRoutes = void 0;
const express_1 = require("express");
const connection_1 = require("../database/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.portfolioRoutes = router;
// Get all portfolios for a user
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        throw (0, errorHandler_1.createError)('User ID required', 400);
    }
    const db = (0, connection_1.getDatabase)();
    const result = await db.query('SELECT * FROM portfolio_service.portfolios WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json({
        success: true,
        data: result.rows
    });
}));
// Create new portfolio
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { name, description } = req.body;
    if (!userId || !name) {
        throw (0, errorHandler_1.createError)('User ID and portfolio name are required', 400);
    }
    const db = (0, connection_1.getDatabase)();
    const result = await db.query(`INSERT INTO portfolio_service.portfolios (user_id, name, description) 
     VALUES ($1, $2, $3) RETURNING *`, [userId, name, description]);
    res.status(201).json({
        success: true,
        data: result.rows[0]
    });
}));
// Get portfolio with holdings
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const db = (0, connection_1.getDatabase)();
    // Get portfolio details
    const portfolioResult = await db.query('SELECT * FROM portfolio_service.portfolios WHERE id = $1 AND user_id = $2', [id, userId]);
    if (portfolioResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Portfolio not found', 404);
    }
    // Get holdings with instrument details
    const holdingsResult = await db.query(`SELECT h.*, i.symbol, i.name, i.type, i.exchange, i.currency
     FROM portfolio_service.holdings h
     JOIN portfolio_service.instruments i ON h.instrument_id = i.id
     WHERE h.portfolio_id = $1`, [id]);
    const portfolio = portfolioResult.rows[0];
    portfolio.holdings = holdingsResult.rows;
    res.json({
        success: true,
        data: portfolio
    });
}));
// Get portfolio performance summary
router.get('/:id/performance', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const db = (0, connection_1.getDatabase)();
    // Verify portfolio ownership
    const portfolioResult = await db.query('SELECT * FROM portfolio_service.portfolios WHERE id = $1 AND user_id = $2', [id, userId]);
    if (portfolioResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Portfolio not found', 404);
    }
    // Get performance metrics
    const performanceResult = await db.query(`SELECT 
       COUNT(*) as total_holdings,
       SUM(market_value) as total_market_value,
       SUM(unrealized_pnl) as total_unrealized_pnl
     FROM portfolio_service.holdings 
     WHERE portfolio_id = $1`, [id]);
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
//# sourceMappingURL=portfolio.js.map