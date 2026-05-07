import { Request, Response, NextFunction } from 'express';
export declare const createError: (message: string, statusCode?: number) => any;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map