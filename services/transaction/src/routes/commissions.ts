import { Router } from 'express';

const router = Router();

// Get commission rates
router.get('/rates', async (req, res) => {
  res.json({
    success: true,
    data: {
      broker_commission: 0.001, // 0.1%
      exchange_commission: 0.0005, // 0.05%
      transaction_tariff: 0.001 // 0.1%
    }
  });
});

export { router as commissionRoutes };
