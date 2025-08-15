import { Request, Response, NextFunction } from 'express';
import { ErrorHandler, DetailedError, ErrorCategory, ErrorSeverity } from '../../core/ErrorHandler';

export interface APIError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: APIError | DetailedError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('API Error:', error);

  // Check if it's a DetailedError from our ErrorHandler
  if ('category' in error && 'severity' in error) {
    const detailedError = error as DetailedError;
    const statusCode = getStatusCodeFromError(detailedError);
    
    res.status(statusCode).json(ErrorHandler.formatErrorForAPI(detailedError));
    return;
  }

  // Handle standard API errors
  const apiError = error as APIError;
  const statusCode = apiError.statusCode || 500;
  const message = apiError.message || 'Internal Server Error';
  const code = apiError.code || 'INTERNAL_ERROR';

  // Create a detailed error for better handling
  const detailedError = ErrorHandler.createDetailedError(
    code,
    message,
    determineErrorCategory(apiError),
    determineErrorSeverity(statusCode),
    {
      operation: req.method,
      endpoint: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    },
    apiError
  );

  res.status(statusCode).json(ErrorHandler.formatErrorForAPI(detailedError));
};

export const createError = (message: string, statusCode: number = 500, code?: string): APIError => {
  const error = new Error(message) as APIError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

/**
 * Create a detailed API error with recovery suggestions
 */
export const createDetailedAPIError = (
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  statusCode: number = 500,
  context: any = {}
): DetailedError => {
  return ErrorHandler.createDetailedError(
    `API_${category}_ERROR`,
    message,
    category,
    severity,
    {
      ...context,
      timestamp: new Date()
    }
  );
};

/**
 * Handle file upload errors with specific guidance
 */
export const handleFileUploadError = (
  error: Error,
  fileName: string,
  fileSize: number,
  req: Request
): DetailedError => {
  let category = ErrorCategory.FILE_SYSTEM;
  let code = 'FILE_UPLOAD_ERROR';

  if (error.message.includes('LIMIT_FILE_SIZE')) {
    code = 'FILE_TOO_LARGE';
    category = ErrorCategory.VALIDATION;
  } else if (error.message.includes('LIMIT_UNEXPECTED_FILE')) {
    code = 'INVALID_FILE_TYPE';
    category = ErrorCategory.VALIDATION;
  }

  return ErrorHandler.createDetailedError(
    code,
    error.message,
    category,
    ErrorSeverity.MEDIUM,
    {
      operation: 'file upload',
      fileName,
      fileSize,
      endpoint: req.path,
      userAgent: req.get('User-Agent')
    },
    error
  );
};

/**
 * Handle compression API errors
 */
export const handleCompressionAPIError = (
  error: Error,
  fileName: string,
  fileSize: number,
  config: any,
  req: Request
): DetailedError => {
  return ErrorHandler.handleCompressionError(
    fileName,
    fileSize,
    config,
    error,
    {
      operation: 'API compression',
      endpoint: req.path,
      userAgent: req.get('User-Agent')
    }
  );
};

/**
 * Handle authentication errors
 */
export const handleAuthError = (
  error: Error,
  req: Request
): DetailedError => {
  return ErrorHandler.handleNetworkError(
    'authentication',
    req.path,
    error,
    {
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    }
  );
};

/**
 * Determine error category from API error
 */
function determineErrorCategory(error: APIError): ErrorCategory {
  if (error.code?.includes('AUTH')) return ErrorCategory.NETWORK;
  if (error.code?.includes('FILE')) return ErrorCategory.FILE_SYSTEM;
  if (error.code?.includes('CONFIG')) return ErrorCategory.CONFIGURATION;
  if (error.code?.includes('COMPRESS')) return ErrorCategory.COMPRESSION;
  if (error.code?.includes('MEMORY')) return ErrorCategory.MEMORY;
  return ErrorCategory.NETWORK;
}

/**
 * Determine error severity from status code
 */
function determineErrorSeverity(statusCode: number): ErrorSeverity {
  if (statusCode >= 500) return ErrorSeverity.HIGH;
  if (statusCode >= 400) return ErrorSeverity.MEDIUM;
  return ErrorSeverity.LOW;
}

/**
 * Get HTTP status code from detailed error
 */
function getStatusCodeFromError(error: DetailedError): number {
  switch (error.category) {
    case ErrorCategory.VALIDATION:
    case ErrorCategory.CONFIGURATION:
      return 400;
    case ErrorCategory.FILE_SYSTEM:
      if (error.code === 'FILE_NOT_FOUND') return 404;
      if (error.code === 'PERMISSION_DENIED') return 403;
      return 400;
    case ErrorCategory.NETWORK:
      if (error.code === 'AUTHENTICATION_ERROR') return 401;
      if (error.code === 'PERMISSION_ERROR') return 403;
      return 400;
    case ErrorCategory.MEMORY:
    case ErrorCategory.PERFORMANCE:
      return 413; // Payload Too Large
    case ErrorCategory.COMPRESSION:
    case ErrorCategory.DECOMPRESSION:
    case ErrorCategory.QUANTUM_SIMULATION:
      return 422; // Unprocessable Entity
    default:
      return 500;
  }
}