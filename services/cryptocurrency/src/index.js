const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'cryptocurrency' });
});

// Metrics endpoint (basic implementation)
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 75
http_requests_total{method="POST",status="200"} 25

# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="heap_used"} ${process.memoryUsage().heapUsed}
nodejs_memory_usage_bytes{type="heap_total"} ${process.memoryUsage().heapTotal}

# HELP cryptocurrency_price_usd Current cryptocurrency prices
# TYPE cryptocurrency_price_usd gauge
cryptocurrency_price_usd{symbol="bitcoin"} 45000
cryptocurrency_price_usd{symbol="ethereum"} 3000

# HELP up Service uptime
# TYPE up gauge
up 1`);
});

// Get cryptocurrency prices
app.get('/api/prices', async (req, res) => {
  try {
    // Mock data for now - would integrate with real APIs
    const prices = {
      bitcoin: { price: 45000, change24h: 2.5 },
      ethereum: { price: 3000, change24h: 1.8 },
      binance: { price: 300, change24h: -0.5 }
    };
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.listen(PORT, () => {
  console.log(`Cryptocurrency service running on port ${PORT}`);
});
