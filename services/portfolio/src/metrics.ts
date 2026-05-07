import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is used to identify the service
register.setDefaultLabels({
  app: 'portfolio-service'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'portfolio_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'portfolio_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'portfolio_active_connections',
  help: 'Number of active connections',
  registers: [register]
});

const portfolioOperations = new client.Counter({
  name: 'portfolio_operations_total',
  help: 'Total number of portfolio operations',
  labelNames: ['operation', 'status'],
  registers: [register]
});

const databaseConnections = new client.Gauge({
  name: 'portfolio_database_connections',
  help: 'Number of active database connections',
  registers: [register]
});

const cacheOperations = new client.Counter({
  name: 'portfolio_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'status'],
  registers: [register]
});

// Middleware to track HTTP requests
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Record metrics
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
      
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
      
    // Decrement active connections
    activeConnections.dec();
  });
  
  next();
};

// Functions to record custom metrics
export const recordPortfolioOperation = (operation: string, status: string) => {
  portfolioOperations.labels(operation, status).inc();
};

export const updateDatabaseConnections = (count: number) => {
  databaseConnections.set(count);
};

export const recordCacheOperation = (operation: string, status: string) => {
  cacheOperations.labels(operation, status).inc();
};

// Metrics endpoint
export const getMetrics = async (req: any, res: any) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
};

export { register };
