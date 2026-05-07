"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    PORT: parseInt(process.env.PORT || '3004', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/portfolio_tracker',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
};
//# sourceMappingURL=config.js.map