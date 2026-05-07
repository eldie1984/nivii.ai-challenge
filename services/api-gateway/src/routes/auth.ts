import { Router, Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/connection';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { config } from '../config';

const router = Router();

// Register endpoint
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const db = getDatabase();
  
  // Check if user exists
  const existingUser = await db.query(
    'SELECT id FROM portfolio_service.users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw createError('User already exists', 409);
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const result = await db.query(
    `INSERT INTO portfolio_service.users (email, password_hash, first_name, last_name) 
     VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name`,
    [email, passwordHash, firstName, lastName]
  );

  const user = result.rows[0];

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    }
  });
}));

// Login endpoint
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const db = getDatabase();
  
  const result = await db.query(
    'SELECT id, email, password_hash, first_name, last_name FROM portfolio_service.users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw createError('Invalid credentials', 401);
  }

  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw createError('Invalid credentials', 401);
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    }
  });
}));

// Middleware to verify JWT
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(createError('Access token required', 401));
  }

  jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return next(createError('Invalid token', 403));
    }
    (req as any).user = user;
    next();
  });
}

export { router as authRoutes };
