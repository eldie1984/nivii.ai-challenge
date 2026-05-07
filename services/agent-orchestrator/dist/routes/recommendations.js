"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationRoutes = void 0;
const express_1 = require("express");
const connection_1 = require("../database/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const openai_1 = __importDefault(require("openai"));
const router = (0, express_1.Router)();
exports.recommendationRoutes = router;
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
// Get AI recommendations for a portfolio
router.post('/generate/:portfolioId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { portfolioId } = req.params;
    const userId = req.headers['x-user-id'];
    const { agentType = 'portfolio_optimizer' } = req.body;
    const db = await (0, connection_1.getDatabase)();
    // Verify portfolio ownership and get portfolio data
    const portfolioResult = await db.query(`SELECT p.*, 
            ARRAY_AGG(
              JSON_BUILD_OBJECT(
                'symbol', i.symbol,
                'name', i.name,
                'type', i.type,
                'quantity', h.quantity,
                'averageCost', h.average_cost,
                'currentPrice', h.current_price,
                'marketValue', h.market_value,
                'unrealizedPnL', h.unrealized_pnl
              )
            ) as holdings
     FROM portfolio_service.portfolios p
     LEFT JOIN portfolio_service.holdings h ON p.id = h.portfolio_id
     LEFT JOIN portfolio_service.instruments i ON h.instrument_id = i.id
     WHERE p.id = $1 AND p.user_id = $2
     GROUP BY p.id`, [portfolioId, userId]);
    if (portfolioResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Portfolio not found', 404);
    }
    const portfolio = portfolioResult.rows[0];
    // Generate AI recommendation
    const prompt = `
    As a financial AI advisor, analyze this portfolio and provide investment recommendations:
    
    Portfolio: ${portfolio.name}
    Total Value: $${portfolio.total_value}
    Holdings: ${JSON.stringify(portfolio.holdings, null, 2)}
    
    Provide analysis on:
    1. Portfolio diversification
    2. Risk assessment
    3. Specific buy/sell/hold recommendations
    4. Target prices for recommendations
    5. Time horizon (short/medium/long term)
    6. Confidence scores for each recommendation
    
    Format as JSON with structure:
    {
      "analysis": "overall portfolio analysis",
      "recommendations": [
        {
          "symbol": "symbol",
          "action": "buy/sell/hold",
          "confidence": 0.85,
          "reasoning": "detailed reasoning",
          "targetPrice": 150.00,
          "timeHorizon": "medium_term"
        }
      ],
      "riskScore": 0.3,
      "diversificationScore": 0.7
    }
  `;
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a professional financial advisor providing investment recommendations." },
            { role: "user", content: prompt }
        ],
        temperature: 0.3
    });
    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
    // Save recommendations to database
    const agentResult = await db.query('SELECT id FROM agent_service.agents WHERE type = $1 AND is_active = true', [agentType]);
    if (agentResult.rows.length > 0) {
        const agentId = agentResult.rows[0].id;
        for (const rec of aiResponse.recommendations) {
            await db.query(`INSERT INTO agent_service.recommendations 
         (agent_id, portfolio_id, instrument_id, recommendation_type, confidence_score, 
          reasoning, target_price, time_horizon, created_at, expires_at)
         VALUES ($1, $2, 
           (SELECT id FROM portfolio_service.instruments WHERE symbol = $3 LIMIT 1),
           $4, $5, $6, $7, $8, NOW(), NOW() + INTERVAL '7 days')`, [agentId, portfolioId, rec.symbol, rec.action, rec.confidence,
                rec.reasoning, rec.targetPrice, rec.timeHorizon]);
        }
    }
    res.json({
        success: true,
        data: {
            portfolioId,
            analysis: aiResponse.analysis,
            recommendations: aiResponse.recommendations,
            riskScore: aiResponse.riskScore,
            diversificationScore: aiResponse.diversificationScore,
            generatedAt: new Date().toISOString()
        }
    });
}));
// Get recommendations for a portfolio
router.get('/portfolio/:portfolioId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { portfolioId } = req.params;
    const userId = req.headers['x-user-id'];
    const db = await (0, connection_1.getDatabase)();
    // Verify portfolio ownership
    const portfolioCheck = await db.query('SELECT id FROM portfolio_service.portfolios WHERE id = $1 AND user_id = $2', [portfolioId, userId]);
    if (portfolioCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Portfolio not found', 404);
    }
    // Get recommendations with agent and instrument details
    const result = await db.query(`SELECT r.*, a.name as agent_name, a.type as agent_type,
            i.symbol, i.name as instrument_name, i.type as instrument_type
     FROM agent_service.recommendations r
     JOIN agent_service.agents a ON r.agent_id = a.id
     LEFT JOIN portfolio_service.instruments i ON r.instrument_id = i.id
     WHERE r.portfolio_id = $1 AND r.expires_at > NOW()
     ORDER BY r.created_at DESC`, [portfolioId]);
    res.json({
        success: true,
        data: result.rows
    });
}));
//# sourceMappingURL=recommendations.js.map