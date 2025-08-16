/**
 * Comprehensive error handling system for QuantumFlow
 * Provides detailed error messages, recovery suggestions, and user guidance
 */
export declare enum ErrorCategory {
    VALIDATION = "VALIDATION",
    COMPRESSION = "COMPRESSION",
    DECOMPRESSION = "DECOMPRESSION",
    CONFIGURATION = "CONFIGURATION",
    FILE_SYSTEM = "FILE_SYSTEM",
    NETWORK = "NETWORK",
    QUANTUM_SIMULATION = "QUANTUM_SIMULATION",
    MEMORY = "MEMORY",
    PERFORMANCE = "PERFORMANCE"
}
export declare enum ErrorSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export interface ErrorContext {
    operation?: string;
    fileName?: string;
    fileSize?: number;
    config?: any;
    memoryUsage?: number;
    processingTime?: number;
    stackTrace?: string;
    userAgent?: string;
    timestamp?: Date;
    endpoint?: string;
    jobId?: string;
    userId?: string;
}
export interface RecoverySuggestion {
    action: string;
    description: string;
    automated?: boolean;
    command?: string;
    priority: number;
}
export interface DetailedError {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    context: ErrorContext;
    recoverySuggestions: RecoverySuggestion[];
    userFriendlyMessage: string;
    technicalDetails?: string;
    relatedErrors?: string[];
    timestamp: Date;
}
export declare class ErrorHandler {
    private static errorHistory;
    private static maxHistorySize;
    /**
     * Create a detailed error with recovery suggestions
     */
    static createDetailedError(code: string, message: string, category: ErrorCategory, severity: ErrorSeverity, context?: ErrorContext, originalError?: Error): DetailedError;
    /**
     * Handle file system errors with specific recovery suggestions
     */
    static handleFileSystemError(operation: string, fileName: string, originalError: Error, context?: ErrorContext): DetailedError;
    /**
     * Handle compression errors with quantum-specific guidance
     */
    static handleCompressionError(fileName: string, fileSize: number, config: any, originalError: Error, context?: ErrorContext): DetailedError;
    /**
     * Handle configuration validation errors
     */
    static handleConfigurationError(parameterName: string, value: any, validRange: any, context?: ErrorContext): DetailedError;
    /**
     * Handle network/API errors
     */
    static handleNetworkError(operation: string, endpoint: string, originalError: Error, context?: ErrorContext): DetailedError;
    /**
     * Generate recovery suggestions based on error code and category
     */
    private static generateRecoverySuggestions;
    /**
     * Generate user-friendly error message
     */
    private static generateUserFriendlyMessage;
    /**
     * Find related errors in history
     */
    private static findRelatedErrors;
    /**
     * Add error to history
     */
    private static addToHistory;
    /**
     * Get error history
     */
    static getErrorHistory(): DetailedError[];
    /**
     * Clear error history
     */
    static clearErrorHistory(): void;
    /**
     * Format error for display
     */
    static formatError(error: DetailedError, includeDetails?: boolean): string;
    /**
     * Format error for JSON API response
     */
    static formatErrorForAPI(error: DetailedError): any;
}
//# sourceMappingURL=ErrorHandler.d.ts.map