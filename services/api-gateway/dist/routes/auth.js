"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
exports.authenticateToken = authenticateToken;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_1 = require("../database/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const config_1 = require("../config");
const router = (0, express_1.Router)();
exports.authRoutes = router;
// Register endpoint
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) {
        throw (0, errorHandler_1.createError)('Email and password are required', 400);
    }
    const db = (0, connection_1.getDatabase)();
    // Check if user exists
    const existingUser = await db.query('SELECT id FROM portfolio_service.users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw (0, errorHandler_1.createError)('User already exists', 409);
    }
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
    // Create user
    const result = await db.query(`INSERT INTO portfolio_service.users (email, password_hash, first_name, last_name) 
     VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name`, [email, passwordHash, firstName, lastName]);
    const user = result.rows[0];
    // Generate JWT
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, config_1.config.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            },
            token
        }
    });
}));
// Login endpoint
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw (0, errorHandler_1.createError)('Email and password are required', 400);
    }
    const db = (0, connection_1.getDatabase)();
    const result = await db.query('SELECT id, email, password_hash, first_name, last_name FROM portfolio_service.users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Invalid credentials', 401);
    }
    const user = result.rows[0];
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw (0, errorHandler_1.createError)('Invalid credentials', 401);
    }
    // Generate JWT
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, config_1.config.JWT_SECRET, { expiresIn: '24h' });
    res.json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            },
            token
        }
    });
}));
// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next((0, errorHandler_1.createError)('Access token required', 401));
    }
    jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET, (err, user) => {
        if (err) {
            return next((0, errorHandler_1.createError)('Invalid token', 403));
        }
        req.user = user;
        next();
    });
}
//# sourceMappingURL=auth.js.map