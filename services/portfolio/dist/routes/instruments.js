"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instrumentRoutes = void 0;
const express_1 = require("express");
const connection_1 = require("../database/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.instrumentRoutes = router;
// Get all instruments
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { type, exchange } = req.query;
    let query = 'SELECT * FROM portfolio_service.instruments WHERE is_active = true';
    const params = [];
    if (type) {
        query += ' AND type = $' + (params.length + 1);
        params.push(type);
    }
    if (exchange) {
        query += ' AND exchange = $' + (params.length + 1);
        params.push(exchange);
    }
    query += ' ORDER BY symbol';
    const db = (0, connection_1.getDatabase)();
    const result = await db.query(query, params);
    res.json({
        success: true,
        data: result.rows
    });
}));
// Create new instrument
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { symbol, name, type, exchange, currency } = req.body;
    if (!symbol || !name || !type) {
        throw (0, errorHandler_1.createError)('Symbol, name, and type are required', 400);
    }
    const validTypes = ['stock', 'option', 'bond', 'crypto', 'etf', 'loan', 'block_shares'];
    if (!validTypes.includes(type)) {
        throw (0, errorHandler_1.createError)('Invalid instrument type', 400);
    }
    const db = (0, connection_1.getDatabase)();
    const result = await db.query(`INSERT INTO portfolio_service.instruments (symbol, name, type, exchange, currency) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [symbol, name, type, exchange || null, currency || 'USD']);
    res.status(201).json({
        success: true,
        data: result.rows[0]
    });
}));
// Get instrument by symbol
router.get('/symbol/:symbol', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { symbol } = req.params;
    const db = (0, connection_1.getDatabase)();
    const result = await db.query('SELECT * FROM portfolio_service.instruments WHERE symbol = $1 AND is_active = true', [symbol]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Instrument not found', 404);
    }
    res.json({
        success: true,
        data: result.rows[0]
    });
}));
//# sourceMappingURL=instruments.js.map