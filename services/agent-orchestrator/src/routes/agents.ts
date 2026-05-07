import { Router, Request, Response } from 'express';
import { getDatabase } from '../database/connection';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Get all agents
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  
  const result = await db.query(
    'SELECT * FROM agent_service.agents WHERE is_active = true ORDER BY created_at DESC'
  );

  res.json({
    success: true,
    data: result.rows
  });
}));

// Get agent by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = await getDatabase();
  
  const result = await db.query(
    'SELECT * FROM agent_service.agents WHERE id = $1 AND is_active = true',
    [id]
  );

  if (result.rows.length === 0) {
    throw createError('Agent not found', 404);
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// Create new agent
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, type, description, config: agentConfig } = req.body;

  if (!name || !type) {
    throw createError('Name and type are required', 400);
  }

  const db = await getDatabase();
  
  const result = await db.query(
    `INSERT INTO agent_service.agents (name, type, description, config)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, type, description, JSON.stringify(agentConfig || {})]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// Update agent
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, description, config: agentConfig, is_active } = req.body;

  const db = await getDatabase();
  
  const result = await db.query(
    `UPDATE agent_service.agents 
     SET name = COALESCE($1, name), 
         type = COALESCE($2, type), 
         description = COALESCE($3, description), 
         config = COALESCE($4, config),
         is_active = COALESCE($5, is_active)
     WHERE id = $6 RETURNING *`,
    [name, type, description, agentConfig ? JSON.stringify(agentConfig) : null, is_active, id]
  );

  if (result.rows.length === 0) {
    throw createError('Agent not found', 404);
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// Delete agent (soft delete)
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = await getDatabase();
  
  const result = await db.query(
    'UPDATE agent_service.agents SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    throw createError('Agent not found', 404);
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

export { router as agentRoutes };
