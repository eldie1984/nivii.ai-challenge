"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyRoutes = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const auth_1 = require("./auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.proxyRoutes = router;
// Service route mappings
const serviceRoutes = {
    '/portfolio': config_1.config.SERVICES.PORTFOLIO,
    '/transactions': config_1.config.SERVICES.TRANSACTION,
    '/agents': config_1.config.SERVICES.AGENT,
    '/crypto': config_1.config.SERVICES.CRYPTO
};
// Apply authentication to all routes except health endpoints
router.use((req, res, next) => {
    if (req.path === '/health' || req.path.startsWith('/health/')) {
        return next();
    }
    (0, auth_1.authenticateToken)(req, res, next);
});
// Generic proxy handler
async function proxyRequest(req, res) {
    const { path } = req;
    // Find matching service
    const servicePath = Object.keys(serviceRoutes).find(route => path.startsWith(route));
    if (!servicePath) {
        throw (0, errorHandler_1.createError)('Service not found', 404);
    }
    const serviceUrl = serviceRoutes[servicePath];
    const targetUrl = `${serviceUrl}${path}`;
    try {
        const response = await (0, axios_1.default)({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': req.user?.userId,
                'X-User-Email': req.user?.email,
                ...req.headers
            },
            params: req.query,
            timeout: 30000
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        if (error.response) {
            // Service responded with error
            res.status(error.response.status).json(error.response.data);
        }
        else if (error.request) {
            // Service unreachable
            throw (0, errorHandler_1.createError)('Service temporarily unavailable', 503);
        }
        else {
            // Other errors
            throw (0, errorHandler_1.createError)('Internal proxy error', 500);
        }
    }
}
// Proxy all requests to appropriate services
router.use('*', (0, errorHandler_1.asyncHandler)(proxyRequest));
//# sourceMappingURL=proxy.js.map