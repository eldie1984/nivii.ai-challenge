import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is used to identify the service
register.setDefaultLabels({
  app: 'agent-orchestrator-service'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'agent_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'agent_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'agent_active_connections',
  help: 'Number of active connections',
  registers: [register]
});

const aiRequests = new client.Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['model', 'operation', 'status'],
  registers: [register]
});

const aiRequestDuration = new client.Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI requests in seconds',
  labelNames: ['model', 'operation'],
  registers: [register]
});

const recommendationsGenerated = new client.Counter({
  name: 'recommendations_generated_total',
  help: 'Total number of recommendations generated',
  labelNames: ['type', 'status'],
  registers: [register]
});

const databaseConnections = new client.Gauge({
  name: 'agent_database_connections',
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
export const recordAIRequest = (model: string, operation: string, status: string, duration: number) => {
  aiRequests.labels(model, operation, status).inc();
  aiRequestDuration.labels(model, operation).observe(duration);
};

export const recordRecommendation = (type: string, status: string) => {
  recommendationsGenerated.labels(type, status).inc();
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
