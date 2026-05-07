"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentRoutes = void 0;
const express_1 = require("express");
const connection_1 = require("../database/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.agentRoutes = router;
// Get all agents
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = await (0, connection_1.getDatabase)();
    const result = await db.query('SELECT * FROM agent_service.agents WHERE is_active = true ORDER BY created_at DESC');
    res.json({
        success: true,
        data: result.rows
    });
}));
// Get agent by ID
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const db = await (0, connection_1.getDatabase)();
    const result = await db.query('SELECT * FROM agent_service.agents WHERE id = $1 AND is_active = true', [id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Agent not found', 404);
    }
    res.json({
        success: true,
        data: result.rows[0]
    });
}));
// Create new agent
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, type, description, config: agentConfig } = req.body;
    if (!name || !type) {
        throw (0, errorHandler_1.createError)('Name and type are required', 400);
    }
    const db = await (0, connection_1.getDatabase)();
    const result = await db.query(`INSERT INTO agent_service.agents (name, type, description, config)
     VALUES ($1, $2, $3, $4) RETURNING *`, [name, type, description, JSON.stringify(agentConfig || {})]);
    res.status(201).json({
        success: true,
        data: result.rows[0]
    });
}));
// Update agent
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, type, description, config: agentConfig, is_active } = req.body;
    const db = await (0, connection_1.getDatabase)();
    const result = await db.query(`UPDATE agent_service.agents 
     SET name = COALESCE($1, name), 
         type = COALESCE($2, type), 
         description = COALESCE($3, description), 
         config = COALESCE($4, config),
         is_active = COALESCE($5, is_active)
     WHERE id = $6 RETURNING *`, [name, type, description, agentConfig ? JSON.stringify(agentConfig) : null, is_active, id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Agent not found', 404);
    }
    res.json({
        success: true,
        data: result.rows[0]
    });
}));
// Delete agent (soft delete)
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const db = await (0, connection_1.getDatabase)();
    const result = await db.query('UPDATE agent_service.agents SET is_active = false WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Agent not found', 404);
    }
    res.json({
        success: true,
        data: result.rows[0]
    });
}));
//# sourceMappingURL=agents.js.map