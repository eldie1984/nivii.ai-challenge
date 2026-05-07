"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/portfolio_tracker',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Service URLs
    SERVICES: {
        PORTFOLIO: process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3002',
        TRANSACTION: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3003',
        AGENT: process.env.AGENT_SERVICE_URL || 'http://localhost:3004',
        CRYPTO: process.env.CRYPTO_SERVICE_URL || 'http://localhost:3005'
    }
};
//# sourceMappingURL=config.js.map