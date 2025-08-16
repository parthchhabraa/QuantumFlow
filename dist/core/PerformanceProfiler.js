"use strict";
/**
 * Performance Profiler for Quantum Compression Engine
 * Task 13.2: Profile and optimize critical performance bottlenecks
 *
 * This profiler identifies performance bottlenecks and provides optimization recommendations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceProfiler = void 0;
class PerformanceProfiler {
    constructor() {
        this.profiles = new Map();
        this.activeOperations = new Map();
        this.enabled = true;
    }
    /**
     * Enable or disable profiling
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Start profiling an operation
     */
    startOperation(operationId, metadata) {
        if (!this.enabled)
            return;
        const startTime = performance.now();
        const memoryBefore = process.memoryUsage();
        this.activeOperations.set(operationId, {
            startTime,
            memoryBefore,
            metadata
        });
    }
    /**
     * End profiling an operation
     */
    endOperation(operationId) {
        if (!this.enabled)
            return null;
        const activeOp = this.activeOperations.get(operationId);
        if (!activeOp) {
            console.warn(`No active operation found for ID: ${operationId}`);
            return null;
        }
        const endTime = performance.now();
        const memoryAfter = process.memoryUsage();
        const duration = endTime - activeOp.startTime;
        const memoryDelta = memoryAfter.heapUsed - activeOp.memoryBefore.heapUsed;
        const profile = {
            operation: operationId,
            startTime: activeOp.startTime,
            endTime,
            duration,
            memoryBefore: activeOp.memoryBefore,
            memoryAfter,
            memoryDelta,
            metadata: activeOp.metadata
        };
        // Store the profile
        if (!this.profiles.has(operationId)) {
            this.profiles.set(operationId, []);
        }
        this.profiles.get(operationId).push(profile);
        // Clean up active operation
        this.activeOperations.delete(operationId);
        return profile;
    }
    /**
     * Get all profiles for an operation
     */
    getProfiles(operationId) {
        return this.profiles.get(operationId) || [];
    }
    /**
     * Get all operation IDs
     */
    getOperationIds() {
        return Array.from(this.profiles.keys());
    }
    /**
     * Analyze bottlenecks across all operations
     */
    analyzeBottlenecks() {
        const analyses = [];
        for (const [operationId, profiles] of this.profiles) {
            if (profiles.length === 0)
                continue;
            const totalTime = profiles.reduce((sum, p) => sum + p.duration, 0);
            const averageTime = totalTime / profiles.length;
            const callCount = profiles.length;
            const memoryImpact = profiles.reduce((sum, p) => sum + Math.abs(p.memoryDelta), 0) / profiles.length;
            // Determine severity based on performance characteristics
            let severity = 'low';
            const recommendations = [];
            if (averageTime > 10000) { // > 10 seconds
                severity = 'critical';
                recommendations.push('Operation takes excessive time - consider algorithmic optimization');
            }
            else if (averageTime > 5000) { // > 5 seconds
                severity = 'high';
                recommendations.push('Operation is slow - investigate optimization opportunities');
            }
            else if (averageTime > 1000) { // > 1 second
                severity = 'medium';
                recommendations.push('Operation could be optimized for better performance');
            }
            if (memoryImpact > 50 * 1024 * 1024) { // > 50MB
                if (severity === 'low')
                    severity = 'medium';
                else if (severity === 'medium')
                    severity = 'high';
                else if (severity === 'high')
                    severity = 'critical';
                recommendations.push('High memory usage - implement memory optimization strategies');
            }
            else if (memoryImpact > 10 * 1024 * 1024) { // > 10MB
                recommendations.push('Moderate memory usage - consider memory efficiency improvements');
            }
            if (callCount > 100 && averageTime > 100) {
                recommendations.push('Frequently called operation - optimize for repeated execution');
            }
            analyses.push({
                operation: operationId,
                totalTime,
                averageTime,
                callCount,
                memoryImpact,
                severity,
                recommendations
            });
        }
        // Sort by severity and total time impact
        return analyses.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
            if (severityDiff !== 0)
                return severityDiff;
            return b.totalTime - a.totalTime;
        });
    }
    /**
     * Generate optimization suggestions based on profiling data
     */
    generateOptimizationSuggestions() {
        const suggestions = [];
        const bottlenecks = this.analyzeBottlenecks();
        for (const bottleneck of bottlenecks) {
            if (bottleneck.operation.includes('superposition') && bottleneck.severity !== 'low') {
                suggestions.push({
                    category: 'algorithm',
                    priority: bottleneck.severity === 'critical' ? 'critical' : 'high',
                    description: 'Superposition processing is a performance bottleneck',
                    expectedImprovement: '50-80% reduction in processing time',
                    implementation: 'Reduce superposition complexity, limit state groups, implement early termination'
                });
            }
            if (bottleneck.operation.includes('entanglement') && bottleneck.severity !== 'low') {
                suggestions.push({
                    category: 'algorithm',
                    priority: bottleneck.severity === 'critical' ? 'critical' : 'medium',
                    description: 'Entanglement detection is consuming excessive resources',
                    expectedImprovement: '30-60% reduction in processing time',
                    implementation: 'Increase correlation threshold, limit state pairs, implement correlation caching'
                });
            }
            if (bottleneck.operation.includes('conversion') && bottleneck.memoryImpact > 20 * 1024 * 1024) {
                suggestions.push({
                    category: 'memory',
                    priority: 'high',
                    description: 'Quantum state conversion is using excessive memory',
                    expectedImprovement: '40-70% reduction in memory usage',
                    implementation: 'Implement streaming conversion, reduce quantum bit depth, optimize chunk sizes'
                });
            }
            if (bottleneck.operation.includes('interference') && bottleneck.averageTime > 2000) {
                suggestions.push({
                    category: 'cpu',
                    priority: 'medium',
                    description: 'Interference optimization is CPU intensive',
                    expectedImprovement: '20-40% reduction in processing time',
                    implementation: 'Optimize interference calculations, reduce iteration count, implement parallel processing'
                });
            }
        }
        // Add general optimization suggestions
        const totalMemoryUsage = bottlenecks.reduce((sum, b) => sum + b.memoryImpact, 0);
        if (totalMemoryUsage > 100 * 1024 * 1024) {
            suggestions.push({
                category: 'memory',
                priority: 'critical',
                description: 'Overall memory usage is excessive',
                expectedImprovement: '50-80% reduction in memory usage',
                implementation: 'Implement memory pooling, reduce quantum state complexity, add garbage collection hints'
            });
        }
        const totalProcessingTime = bottlenecks.reduce((sum, b) => sum + b.totalTime, 0);
        if (totalProcessingTime > 30000) { // > 30 seconds total
            suggestions.push({
                category: 'configuration',
                priority: 'high',
                description: 'Overall processing time is excessive',
                expectedImprovement: '30-60% reduction in processing time',
                implementation: 'Optimize quantum parameters, implement adaptive complexity, add early termination conditions'
            });
        }
        return suggestions.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    /**
     * Generate a comprehensive performance report
     */
    generateReport() {
        const bottlenecks = this.analyzeBottlenecks();
        const suggestions = this.generateOptimizationSuggestions();
        let report = '# Quantum Compression Performance Report\n\n';
        // Executive Summary
        report += '## Executive Summary\n\n';
        const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical').length;
        const highBottlenecks = bottlenecks.filter(b => b.severity === 'high').length;
        if (criticalBottlenecks > 0) {
            report += `⚠️  **${criticalBottlenecks} critical performance bottleneck(s) identified**\n`;
        }
        if (highBottlenecks > 0) {
            report += `🔶 **${highBottlenecks} high-priority performance issue(s) identified**\n`;
        }
        if (criticalBottlenecks === 0 && highBottlenecks === 0) {
            report += '✅ **No critical performance issues identified**\n';
        }
        report += '\n';
        // Bottleneck Analysis
        report += '## Performance Bottlenecks\n\n';
        if (bottlenecks.length === 0) {
            report += 'No performance data available.\n\n';
        }
        else {
            for (const bottleneck of bottlenecks) {
                const severityIcon = {
                    critical: '🔴',
                    high: '🟠',
                    medium: '🟡',
                    low: '🟢'
                }[bottleneck.severity];
                report += `### ${severityIcon} ${bottleneck.operation}\n\n`;
                report += `- **Severity**: ${bottleneck.severity.toUpperCase()}\n`;
                report += `- **Average Time**: ${bottleneck.averageTime.toFixed(2)}ms\n`;
                report += `- **Total Time**: ${bottleneck.totalTime.toFixed(2)}ms\n`;
                report += `- **Call Count**: ${bottleneck.callCount}\n`;
                report += `- **Memory Impact**: ${(bottleneck.memoryImpact / 1024 / 1024).toFixed(2)}MB\n`;
                if (bottleneck.recommendations.length > 0) {
                    report += '- **Recommendations**:\n';
                    for (const rec of bottleneck.recommendations) {
                        report += `  - ${rec}\n`;
                    }
                }
                report += '\n';
            }
        }
        // Optimization Suggestions
        report += '## Optimization Suggestions\n\n';
        if (suggestions.length === 0) {
            report += 'No specific optimization suggestions at this time.\n\n';
        }
        else {
            for (const suggestion of suggestions) {
                const priorityIcon = {
                    critical: '🔴',
                    high: '🟠',
                    medium: '🟡',
                    low: '🟢'
                }[suggestion.priority];
                report += `### ${priorityIcon} ${suggestion.category.toUpperCase()}: ${suggestion.description}\n\n`;
                report += `- **Priority**: ${suggestion.priority.toUpperCase()}\n`;
                report += `- **Expected Improvement**: ${suggestion.expectedImprovement}\n`;
                report += `- **Implementation**: ${suggestion.implementation}\n\n`;
            }
        }
        // Performance Metrics Summary
        report += '## Performance Metrics Summary\n\n';
        const totalOperations = bottlenecks.reduce((sum, b) => sum + b.callCount, 0);
        const totalTime = bottlenecks.reduce((sum, b) => sum + b.totalTime, 0);
        const totalMemory = bottlenecks.reduce((sum, b) => sum + b.memoryImpact, 0);
        report += `- **Total Operations**: ${totalOperations}\n`;
        report += `- **Total Processing Time**: ${(totalTime / 1000).toFixed(2)} seconds\n`;
        report += `- **Total Memory Impact**: ${(totalMemory / 1024 / 1024).toFixed(2)}MB\n`;
        report += `- **Average Operation Time**: ${totalOperations > 0 ? (totalTime / totalOperations).toFixed(2) : 0}ms\n`;
        return report;
    }
    /**
     * Clear all profiling data
     */
    clear() {
        this.profiles.clear();
        this.activeOperations.clear();
    }
    /**
     * Get memory usage statistics
     */
    getMemoryStats() {
        const current = process.memoryUsage();
        const allProfiles = Array.from(this.profiles.values()).flat();
        if (allProfiles.length === 0) {
            return { current, peak: current.heapUsed, average: current.heapUsed };
        }
        const memoryUsages = allProfiles.map(p => p.memoryAfter.heapUsed);
        const peak = Math.max(...memoryUsages);
        const average = memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length;
        return { current, peak, average };
    }
}
exports.PerformanceProfiler = PerformanceProfiler;
//# sourceMappingURL=PerformanceProfiler.js.map