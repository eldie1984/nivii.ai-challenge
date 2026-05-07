import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config';
import { authenticateToken } from './auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Service route mappings
const serviceRoutes = {
  '/portfolio': config.SERVICES.PORTFOLIO,
  '/transactions': config.SERVICES.TRANSACTION,
  '/agents': config.SERVICES.AGENT,
  '/crypto': config.SERVICES.CRYPTO
};

// Apply authentication to all routes except health endpoints
router.use((req, res, next) => {
  if (req.path === '/health' || req.path.startsWith('/health/')) {
    return next();
  }
  authenticateToken(req, res, next);
});

// Generic proxy handler
async function proxyRequest(req: Request, res: Response) {
  const { path } = req;
  
  // Find matching service
  const servicePath = Object.keys(serviceRoutes).find(route => path.startsWith(route));
  
  if (!servicePath) {
    throw createError('Service not found', 404);
  }

  const serviceUrl = serviceRoutes[servicePath as keyof typeof serviceRoutes];
  const targetUrl = `${serviceUrl}${path}`;

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': (req as any).user?.userId,
        'X-User-Email': (req as any).user?.email,
        ...req.headers
      },
      params: req.query,
      timeout: 30000
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // Service responded with error
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // Service unreachable
      throw createError('Service temporarily unavailable', 503);
    } else {
      // Other errors
      throw createError('Internal proxy error', 500);
    }
  }
}

// Proxy all requests to appropriate services
router.use('*', asyncHandler(proxyRequest));

export { router as proxyRoutes };
