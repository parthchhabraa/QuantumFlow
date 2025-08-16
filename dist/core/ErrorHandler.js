"use strict";
/**
 * Comprehensive error handling system for QuantumFlow
 * Provides detailed error messages, recovery suggestions, and user guidance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ErrorSeverity = exports.ErrorCategory = void 0;
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["COMPRESSION"] = "COMPRESSION";
    ErrorCategory["DECOMPRESSION"] = "DECOMPRESSION";
    ErrorCategory["CONFIGURATION"] = "CONFIGURATION";
    ErrorCategory["FILE_SYSTEM"] = "FILE_SYSTEM";
    ErrorCategory["NETWORK"] = "NETWORK";
    ErrorCategory["QUANTUM_SIMULATION"] = "QUANTUM_SIMULATION";
    ErrorCategory["MEMORY"] = "MEMORY";
    ErrorCategory["PERFORMANCE"] = "PERFORMANCE";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "LOW";
    ErrorSeverity["MEDIUM"] = "MEDIUM";
    ErrorSeverity["HIGH"] = "HIGH";
    ErrorSeverity["CRITICAL"] = "CRITICAL";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class ErrorHandler {
    /**
     * Create a detailed error with recovery suggestions
     */
    static createDetailedError(code, message, category, severity, context = {}, originalError) {
        const detailedError = {
            code,
            message,
            category,
            severity,
            context: {
                ...context,
                timestamp: new Date(),
                stackTrace: originalError?.stack || new Error().stack
            },
            recoverySuggestions: this.generateRecoverySuggestions(code, category, context),
            userFriendlyMessage: this.generateUserFriendlyMessage(code, category, context),
            technicalDetails: originalError?.message,
            relatedErrors: this.findRelatedErrors(code, category),
            timestamp: new Date()
        };
        // Add to error history
        this.addToHistory(detailedError);
        return detailedError;
    }
    /**
     * Handle file system errors with specific recovery suggestions
     */
    static handleFileSystemError(operation, fileName, originalError, context = {}) {
        let code;
        let userMessage;
        let suggestions = [];
        if (originalError.message.includes('ENOENT')) {
            code = 'FILE_NOT_FOUND';
            userMessage = `The file "${fileName}" could not be found.`;
            suggestions = [
                {
                    action: 'Check file path',
                    description: 'Verify the file path is correct and the file exists',
                    priority: 5
                },
                {
                    action: 'Check permissions',
                    description: 'Ensure you have read permissions for the file and directory',
                    priority: 4
                },
                {
                    action: 'Use absolute path',
                    description: 'Try using the full absolute path to the file',
                    priority: 3
                }
            ];
        }
        else if (originalError.message.includes('EACCES')) {
            code = 'PERMISSION_DENIED';
            userMessage = `Permission denied when trying to ${operation} "${fileName}".`;
            suggestions = [
                {
                    action: 'Check file permissions',
                    description: 'Ensure you have the necessary permissions to access this file',
                    command: `ls -la "${fileName}"`,
                    priority: 5
                },
                {
                    action: 'Run with elevated privileges',
                    description: 'Try running the command with sudo (use with caution)',
                    command: `sudo quantumflow "${fileName}"`,
                    priority: 3
                },
                {
                    action: 'Change file ownership',
                    description: 'Change the file ownership to your user account',
                    command: `sudo chown $USER "${fileName}"`,
                    priority: 4
                }
            ];
        }
        else if (originalError.message.includes('ENOSPC')) {
            code = 'DISK_FULL';
            userMessage = `Not enough disk space to ${operation} "${fileName}".`;
            suggestions = [
                {
                    action: 'Free up disk space',
                    description: 'Delete unnecessary files or move them to another location',
                    priority: 5
                },
                {
                    action: 'Check available space',
                    description: 'Check how much free space is available',
                    command: 'df -h',
                    priority: 4
                },
                {
                    action: 'Use different output location',
                    description: 'Specify an output location on a drive with more space',
                    priority: 4
                }
            ];
        }
        else {
            code = 'FILE_SYSTEM_ERROR';
            userMessage = `An error occurred while trying to ${operation} "${fileName}".`;
            suggestions = [
                {
                    action: 'Retry operation',
                    description: 'The error might be temporary, try the operation again',
                    priority: 4
                },
                {
                    action: 'Check file system',
                    description: 'Run a file system check to ensure disk integrity',
                    command: 'fsck',
                    priority: 3
                }
            ];
        }
        return this.createDetailedError(code, originalError.message, ErrorCategory.FILE_SYSTEM, ErrorSeverity.HIGH, {
            ...context,
            operation,
            fileName
        }, originalError);
    }
    /**
     * Handle compression errors with quantum-specific guidance
     */
    static handleCompressionError(fileName, fileSize, config, originalError, context = {}) {
        let code;
        let severity;
        let suggestions = [];
        if (originalError.message.includes('memory') || originalError.message.includes('heap')) {
            code = 'COMPRESSION_MEMORY_ERROR';
            severity = ErrorSeverity.HIGH;
            suggestions = [
                {
                    action: 'Reduce quantum bit depth',
                    description: `Current bit depth: ${config.quantumBitDepth}. Try reducing to ${Math.max(2, config.quantumBitDepth - 2)}`,
                    priority: 5
                },
                {
                    action: 'Reduce superposition complexity',
                    description: `Current complexity: ${config.superpositionComplexity}. Try reducing to ${Math.max(1, config.superpositionComplexity - 2)}`,
                    priority: 4
                },
                {
                    action: 'Process in smaller chunks',
                    description: 'Break the file into smaller pieces and compress separately',
                    priority: 4
                },
                {
                    action: 'Close other applications',
                    description: 'Free up system memory by closing unnecessary applications',
                    priority: 3
                }
            ];
        }
        else if (originalError.message.includes('quantum state')) {
            code = 'QUANTUM_STATE_ERROR';
            severity = ErrorSeverity.MEDIUM;
            suggestions = [
                {
                    action: 'Adjust quantum parameters',
                    description: 'The current quantum configuration may not be suitable for this data',
                    priority: 5
                },
                {
                    action: 'Use classical fallback',
                    description: 'Enable classical compression fallback for problematic files',
                    priority: 4
                },
                {
                    action: 'Analyze data characteristics',
                    description: 'Check if the data has unusual patterns that affect quantum processing',
                    priority: 3
                }
            ];
        }
        else if (originalError.message.includes('timeout')) {
            code = 'COMPRESSION_TIMEOUT';
            severity = ErrorSeverity.MEDIUM;
            suggestions = [
                {
                    action: 'Reduce processing complexity',
                    description: 'Lower quantum parameters to speed up processing',
                    priority: 5
                },
                {
                    action: 'Enable progress mode',
                    description: 'Use --progress flag to monitor compression progress',
                    command: `quantumflow --progress "${fileName}"`,
                    priority: 4
                },
                {
                    action: 'Process smaller files',
                    description: 'Split large files into smaller chunks before compression',
                    priority: 3
                }
            ];
        }
        else {
            code = 'COMPRESSION_FAILED';
            severity = ErrorSeverity.HIGH;
            suggestions = [
                {
                    action: 'Try different quantum parameters',
                    description: 'Experiment with different quantum configuration settings',
                    priority: 4
                },
                {
                    action: 'Check file format',
                    description: 'Ensure the file is not corrupted and is in a supported format',
                    priority: 4
                },
                {
                    action: 'Use verbose mode',
                    description: 'Run with --verbose flag to get more detailed error information',
                    command: `quantumflow --verbose "${fileName}"`,
                    priority: 3
                }
            ];
        }
        return this.createDetailedError(code, originalError.message, ErrorCategory.COMPRESSION, severity, {
            ...context,
            operation: 'compression',
            fileName,
            fileSize,
            config
        }, originalError);
    }
    /**
     * Handle configuration validation errors
     */
    static handleConfigurationError(parameterName, value, validRange, context = {}) {
        const suggestions = [
            {
                action: 'Use recommended value',
                description: `Set ${parameterName} to a value between ${validRange.min} and ${validRange.max}`,
                priority: 5
            },
            {
                action: 'Use preset configuration',
                description: 'Try using a preset configuration profile for your data type',
                priority: 4
            },
            {
                action: 'Auto-optimize parameters',
                description: 'Let QuantumFlow automatically optimize parameters for your data',
                priority: 3
            }
        ];
        if (validRange.recommended) {
            suggestions.unshift({
                action: 'Use recommended value',
                description: `Recommended values for ${parameterName}: ${validRange.recommended.join(', ')}`,
                priority: 5
            });
        }
        return this.createDetailedError('INVALID_CONFIGURATION', `Invalid value for ${parameterName}: ${value}`, ErrorCategory.CONFIGURATION, ErrorSeverity.MEDIUM, {
            ...context,
            config: { [parameterName]: value, validRange }
        });
    }
    /**
     * Handle network/API errors
     */
    static handleNetworkError(operation, endpoint, originalError, context = {}) {
        let code;
        let suggestions = [];
        if (originalError.message.includes('timeout')) {
            code = 'NETWORK_TIMEOUT';
            suggestions = [
                {
                    action: 'Check internet connection',
                    description: 'Ensure you have a stable internet connection',
                    priority: 5
                },
                {
                    action: 'Retry operation',
                    description: 'Network timeouts are often temporary, try again',
                    priority: 4
                },
                {
                    action: 'Use smaller files',
                    description: 'Large file uploads may timeout, try smaller files',
                    priority: 3
                }
            ];
        }
        else if (originalError.message.includes('401') || originalError.message.includes('unauthorized')) {
            code = 'AUTHENTICATION_ERROR';
            suggestions = [
                {
                    action: 'Check credentials',
                    description: 'Verify your login credentials are correct',
                    priority: 5
                },
                {
                    action: 'Refresh authentication',
                    description: 'Log out and log back in to refresh your session',
                    priority: 4
                },
                {
                    action: 'Check account status',
                    description: 'Ensure your account is active and not suspended',
                    priority: 3
                }
            ];
        }
        else if (originalError.message.includes('403') || originalError.message.includes('forbidden')) {
            code = 'PERMISSION_ERROR';
            suggestions = [
                {
                    action: 'Check permissions',
                    description: 'You may not have permission to perform this operation',
                    priority: 5
                },
                {
                    action: 'Contact administrator',
                    description: 'Contact your system administrator for access',
                    priority: 4
                }
            ];
        }
        else {
            code = 'NETWORK_ERROR';
            suggestions = [
                {
                    action: 'Check connection',
                    description: 'Verify your network connection is working',
                    priority: 5
                },
                {
                    action: 'Try again later',
                    description: 'The service may be temporarily unavailable',
                    priority: 4
                }
            ];
        }
        return this.createDetailedError(code, originalError.message, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, {
            ...context,
            operation,
            endpoint
        }, originalError);
    }
    /**
     * Generate recovery suggestions based on error code and category
     */
    static generateRecoverySuggestions(code, category, context) {
        const suggestions = [];
        // Add category-specific suggestions
        switch (category) {
            case ErrorCategory.MEMORY:
                suggestions.push({
                    action: 'Free system memory',
                    description: 'Close unnecessary applications to free up memory',
                    priority: 5
                }, {
                    action: 'Reduce quantum parameters',
                    description: 'Lower quantum bit depth and complexity settings',
                    priority: 4
                });
                break;
            case ErrorCategory.PERFORMANCE:
                suggestions.push({
                    action: 'Optimize settings',
                    description: 'Use performance-optimized quantum parameters',
                    priority: 4
                }, {
                    action: 'Process smaller files',
                    description: 'Break large files into smaller chunks',
                    priority: 3
                });
                break;
            case ErrorCategory.QUANTUM_SIMULATION:
                suggestions.push({
                    action: 'Adjust quantum parameters',
                    description: 'Try different quantum configuration settings',
                    priority: 4
                }, {
                    action: 'Enable fallback mode',
                    description: 'Use classical compression as fallback',
                    priority: 3
                });
                break;
        }
        // Add general suggestions
        suggestions.push({
            action: 'Check documentation',
            description: 'Consult the QuantumFlow documentation for detailed guidance',
            priority: 2
        }, {
            action: 'Report issue',
            description: 'If the problem persists, report it to the development team',
            priority: 1
        });
        return suggestions.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Generate user-friendly error message
     */
    static generateUserFriendlyMessage(code, category, context) {
        const operation = context.operation || 'operation';
        const fileName = context.fileName || 'file';
        switch (code) {
            case 'FILE_NOT_FOUND':
                return `We couldn't find the file "${fileName}". Please check the file path and try again.`;
            case 'PERMISSION_DENIED':
                return `You don't have permission to access "${fileName}". Please check the file permissions.`;
            case 'DISK_FULL':
                return `There's not enough disk space to complete the ${operation}. Please free up some space and try again.`;
            case 'COMPRESSION_MEMORY_ERROR':
                return `The file is too large or complex for the current settings. Try reducing the quantum parameters or processing a smaller file.`;
            case 'QUANTUM_STATE_ERROR':
                return `The quantum compression algorithm encountered an issue with this data. Try adjusting the quantum parameters or using classical fallback.`;
            case 'COMPRESSION_TIMEOUT':
                return `The compression is taking longer than expected. Try using simpler quantum parameters or enable progress monitoring.`;
            case 'INVALID_CONFIGURATION':
                return `The quantum configuration has invalid settings. Please check the parameter values and use recommended ranges.`;
            case 'NETWORK_TIMEOUT':
                return `The network request timed out. Please check your internet connection and try again.`;
            case 'AUTHENTICATION_ERROR':
                return `Authentication failed. Please check your credentials and try logging in again.`;
            default:
                return `An error occurred during ${operation}. Please check the details below and try the suggested solutions.`;
        }
    }
    /**
     * Find related errors in history
     */
    static findRelatedErrors(code, category) {
        return this.errorHistory
            .filter(error => error.code === code ||
            error.category === category)
            .slice(-3) // Last 3 related errors
            .map(error => `${error.code}: ${error.message}`);
    }
    /**
     * Add error to history
     */
    static addToHistory(error) {
        this.errorHistory.push(error);
        // Keep history size manageable
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
        }
    }
    /**
     * Get error history
     */
    static getErrorHistory() {
        return [...this.errorHistory];
    }
    /**
     * Clear error history
     */
    static clearErrorHistory() {
        this.errorHistory = [];
    }
    /**
     * Format error for display
     */
    static formatError(error, includeDetails = false) {
        let output = `\n❌ ${error.userFriendlyMessage}\n`;
        if (includeDetails) {
            output += `\nError Code: ${error.code}\n`;
            output += `Category: ${error.category}\n`;
            output += `Severity: ${error.severity}\n`;
            if (error.context.fileName) {
                output += `File: ${error.context.fileName}\n`;
            }
            if (error.context.operation) {
                output += `Operation: ${error.context.operation}\n`;
            }
        }
        output += `\n🔧 Suggested Solutions:\n`;
        error.recoverySuggestions.slice(0, 3).forEach((suggestion, index) => {
            output += `${index + 1}. ${suggestion.action}: ${suggestion.description}\n`;
            if (suggestion.command) {
                output += `   Command: ${suggestion.command}\n`;
            }
        });
        if (error.relatedErrors && error.relatedErrors.length > 0) {
            output += `\n📋 Related Issues:\n`;
            error.relatedErrors.forEach(relatedError => {
                output += `• ${relatedError}\n`;
            });
        }
        return output;
    }
    /**
     * Format error for JSON API response
     */
    static formatErrorForAPI(error) {
        return {
            error: {
                code: error.code,
                message: error.userFriendlyMessage,
                category: error.category,
                severity: error.severity,
                timestamp: error.timestamp.toISOString(),
                context: {
                    operation: error.context.operation,
                    fileName: error.context.fileName,
                    fileSize: error.context.fileSize
                },
                recoverySuggestions: error.recoverySuggestions.slice(0, 3).map(suggestion => ({
                    action: suggestion.action,
                    description: suggestion.description,
                    command: suggestion.command,
                    priority: suggestion.priority
                })),
                technicalDetails: error.technicalDetails
            }
        };
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.errorHistory = [];
ErrorHandler.maxHistorySize = 100;
//# sourceMappingURL=ErrorHandler.js.map