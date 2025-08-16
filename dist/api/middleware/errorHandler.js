"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAuthError = exports.handleCompressionAPIError = exports.handleFileUploadError = exports.createDetailedAPIError = exports.createError = exports.errorHandler = void 0;
const ErrorHandler_1 = require("../../core/ErrorHandler");
const errorHandler = (error, req, res, next) => {
    console.error('API Error:', error);
    // Check if it's a DetailedError from our ErrorHandler
    if ('category' in error && 'severity' in error) {
        const detailedError = error;
        const statusCode = getStatusCodeFromError(detailedError);
        res.status(statusCode).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(detailedError));
        return;
    }
    // Handle standard API errors
    const apiError = error;
    const statusCode = apiError.statusCode || 500;
    const message = apiError.message || 'Internal Server Error';
    const code = apiError.code || 'INTERNAL_ERROR';
    // Create a detailed error for better handling
    const detailedError = ErrorHandler_1.ErrorHandler.createDetailedError(code, message, determineErrorCategory(apiError), determineErrorSeverity(statusCode), {
        operation: req.method,
        endpoint: req.path,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
    }, apiError);
    res.status(statusCode).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(detailedError));
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};
exports.createError = createError;
/**
 * Create a detailed API error with recovery suggestions
 */
const createDetailedAPIError = (message, category, severity, statusCode = 500, context = {}) => {
    return ErrorHandler_1.ErrorHandler.createDetailedError(`API_${category}_ERROR`, message, category, severity, {
        ...context,
        timestamp: new Date()
    });
};
exports.createDetailedAPIError = createDetailedAPIError;
/**
 * Handle file upload errors with specific guidance
 */
const handleFileUploadError = (error, fileName, fileSize, req) => {
    let category = ErrorHandler_1.ErrorCategory.FILE_SYSTEM;
    let code = 'FILE_UPLOAD_ERROR';
    if (error.message.includes('LIMIT_FILE_SIZE')) {
        code = 'FILE_TOO_LARGE';
        category = ErrorHandler_1.ErrorCategory.VALIDATION;
    }
    else if (error.message.includes('LIMIT_UNEXPECTED_FILE')) {
        code = 'INVALID_FILE_TYPE';
        category = ErrorHandler_1.ErrorCategory.VALIDATION;
    }
    return ErrorHandler_1.ErrorHandler.createDetailedError(code, error.message, category, ErrorHandler_1.ErrorSeverity.MEDIUM, {
        operation: 'file upload',
        fileName,
        fileSize,
        endpoint: req.path,
        userAgent: req.get('User-Agent')
    }, error);
};
exports.handleFileUploadError = handleFileUploadError;
/**
 * Handle compression API errors
 */
const handleCompressionAPIError = (error, fileName, fileSize, config, req) => {
    return ErrorHandler_1.ErrorHandler.handleCompressionError(fileName, fileSize, config, error, {
        operation: 'API compression',
        endpoint: req.path,
        userAgent: req.get('User-Agent')
    });
};
exports.handleCompressionAPIError = handleCompressionAPIError;
/**
 * Handle authentication errors
 */
const handleAuthError = (error, req) => {
    return ErrorHandler_1.ErrorHandler.handleNetworkError('authentication', req.path, error, {
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
    });
};
exports.handleAuthError = handleAuthError;
/**
 * Determine error category from API error
 */
function determineErrorCategory(error) {
    if (error.code?.includes('AUTH'))
        return ErrorHandler_1.ErrorCategory.NETWORK;
    if (error.code?.includes('FILE'))
        return ErrorHandler_1.ErrorCategory.FILE_SYSTEM;
    if (error.code?.includes('CONFIG'))
        return ErrorHandler_1.ErrorCategory.CONFIGURATION;
    if (error.code?.includes('COMPRESS'))
        return ErrorHandler_1.ErrorCategory.COMPRESSION;
    if (error.code?.includes('MEMORY'))
        return ErrorHandler_1.ErrorCategory.MEMORY;
    return ErrorHandler_1.ErrorCategory.NETWORK;
}
/**
 * Determine error severity from status code
 */
function determineErrorSeverity(statusCode) {
    if (statusCode >= 500)
        return ErrorHandler_1.ErrorSeverity.HIGH;
    if (statusCode >= 400)
        return ErrorHandler_1.ErrorSeverity.MEDIUM;
    return ErrorHandler_1.ErrorSeverity.LOW;
}
/**
 * Get HTTP status code from detailed error
 */
function getStatusCodeFromError(error) {
    switch (error.category) {
        case ErrorHandler_1.ErrorCategory.VALIDATION:
        case ErrorHandler_1.ErrorCategory.CONFIGURATION:
            return 400;
        case ErrorHandler_1.ErrorCategory.FILE_SYSTEM:
            if (error.code === 'FILE_NOT_FOUND')
                return 404;
            if (error.code === 'PERMISSION_DENIED')
                return 403;
            return 400;
        case ErrorHandler_1.ErrorCategory.NETWORK:
            if (error.code === 'AUTHENTICATION_ERROR')
                return 401;
            if (error.code === 'PERMISSION_ERROR')
                return 403;
            return 400;
        case ErrorHandler_1.ErrorCategory.MEMORY:
        case ErrorHandler_1.ErrorCategory.PERFORMANCE:
            return 413; // Payload Too Large
        case ErrorHandler_1.ErrorCategory.COMPRESSION:
        case ErrorHandler_1.ErrorCategory.DECOMPRESSION:
        case ErrorHandler_1.ErrorCategory.QUANTUM_SIMULATION:
            return 422; // Unprocessable Entity
        default:
            return 500;
    }
}
//# sourceMappingURL=errorHandler.js.map