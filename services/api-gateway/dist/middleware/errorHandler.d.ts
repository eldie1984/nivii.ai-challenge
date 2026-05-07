import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare function errorHandler(error: AppError, req: Request, res: Response, next: NextFunction): void;
export declare function createError(message: string, statusCode?: number): AppError;
export declare function asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map