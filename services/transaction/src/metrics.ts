import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is used to identify the service
register.setDefaultLabels({
  app: 'transaction-service'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'transaction_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'transaction_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'transaction_active_connections',
  help: 'Number of active connections',
  registers: [register]
});

const transactionOperations = new client.Counter({
  name: 'transaction_operations_total',
  help: 'Total number of transaction operations',
  labelNames: ['operation', 'status', 'currency'],
  registers: [register]
});

const transactionVolume = new client.Histogram({
  name: 'transaction_volume_usd',
  help: 'Transaction volume in USD',
  labelNames: ['operation', 'currency'],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000],
  registers: [register]
});

const commissionCalculations = new client.Counter({
  name: 'commission_calculations_total',
  help: 'Total number of commission calculations',
  labelNames: ['tariff_type', 'status'],
  registers: [register]
});

const commissionAmount = new client.Histogram({
  name: 'commission_amount_usd',
  help: 'Commission amount in USD',
  labelNames: ['tariff_type'],
  buckets: [0.1, 0.5, 1, 5, 10, 25, 50, 100],
  registers: [register]
});

const databaseConnections = new client.Gauge({
  name: 'transaction_database_connections',
  help: 'Number of active database connections',
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
export const recordTransaction = (operation: string, status: string, currency: string, amount: number) => {
  transactionOperations.labels(operation, status, currency).inc();
  transactionVolume.labels(operation, currency).observe(amount);
};

export const recordCommission = (tariffType: string, status: string, amount: number) => {
  commissionCalculations.labels(tariffType, status).inc();
  commissionAmount.labels(tariffType).observe(amount);
};

export const updateDatabaseConnections = (count: number) => {
  databaseConnections.set(count);
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
