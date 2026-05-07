import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { transactionRoutes } from './routes/transactions';
import { commissionRoutes } from './routes/commissions';
import { errorHandler } from './middleware/errorHandler';
import { connectDatabase } from './database/connection';
import { metricsMiddleware, getMetrics } from './metrics';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Metrics middleware
app.use(metricsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'transaction-service', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', getMetrics);

// Routes
app.use('/transactions', transactionRoutes);
app.use('/commissions', commissionRoutes);

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDatabase();
    app.listen(config.PORT, () => {
      console.log(`Transaction Service running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
