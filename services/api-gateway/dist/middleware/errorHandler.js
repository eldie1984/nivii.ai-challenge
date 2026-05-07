"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.createError = createError;
exports.asyncHandler = asyncHandler;
function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    // Log error details
    console.error(`Error ${statusCode}: ${message}`);
    console.error(error.stack);
    // Don't leak error details in production
    const response = {
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
            ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
        }
    };
    res.status(statusCode).json(response);
}
function createError(message, statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map