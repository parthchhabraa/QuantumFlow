import { Request, Response, NextFunction } from 'express';
import { DetailedError, ErrorCategory, ErrorSeverity } from '../../core/ErrorHandler';
export interface APIError extends Error {
    statusCode?: number;
    code?: string;
}
export declare const errorHandler: (error: APIError | DetailedError, req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode?: number, code?: string) => APIError;
/**
 * Create a detailed API error with recovery suggestions
 */
export declare const createDetailedAPIError: (message: string, category: ErrorCategory, severity: ErrorSeverity, statusCode?: number, context?: any) => DetailedError;
/**
 * Handle file upload errors with specific guidance
 */
export declare const handleFileUploadError: (error: Error, fileName: string, fileSize: number, req: Request) => DetailedError;
/**
 * Handle compression API errors
 */
export declare const handleCompressionAPIError: (error: Error, fileName: string, fileSize: number, config: any, req: Request) => DetailedError;
/**
 * Handle authentication errors
 */
export declare const handleAuthError: (error: Error, req: Request) => DetailedError;
//# sourceMappingURL=errorHandler.d.ts.map