"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const portfolio_1 = require("./routes/portfolio");
const instruments_1 = require("./routes/instruments");
const errorHandler_1 = require("./middleware/errorHandler");
const connection_1 = require("./database/connection");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
// Logging
app.use((0, morgan_1.default)('combined'));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'portfolio-service', timestamp: new Date().toISOString() });
});
// Routes
app.use('/portfolios', portfolio_1.portfolioRoutes);
app.use('/instruments', instruments_1.instrumentRoutes);
// Error handling
app.use(errorHandler_1.errorHandler);
// Start server
async function startServer() {
    try {
        await (0, connection_1.connectDatabase)();
        app.listen(config_1.config.PORT, () => {
            console.log(`Portfolio Service running on port ${config_1.config.PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map