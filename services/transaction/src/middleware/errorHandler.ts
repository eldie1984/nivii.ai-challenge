import { Request, Response, NextFunction } from 'express';

export const createError = (message: string, statusCode: number = 500) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e: any) => e.message).join(', ');
  }

  // Duplicate key error
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry';
  }

  // Foreign key constraint
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
