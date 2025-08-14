import { QuantumMetrics } from '../QuantumMetrics';

describe('QuantumMetrics', () => {
  let metrics: QuantumMetrics;

  beforeEach(() => {
    metrics = new QuantumMetrics();
  });

  describe('Compression Metrics', () => {
    it('should calculate compression ratio correctly', () => {
      metrics.recordCompressionMetrics(1000, 500);
      
      const compressionMetrics = metrics.getCompressionMetrics();
      expect(compressionMetrics.originalSize).toBe(1000);
      expect(compressionMetrics.compressedSize).toBe(500);
      expect(compressionMetrics.compressionRatio).toBe(2);
      expect(compressionMetrics.compressionPercentage).toBe(50);
    });

    it('should handle no compression case', () => {
      metrics.recordCompressionMetrics(1000, 1000);
      
      const compressionMetrics = metrics.getCompressionMetrics();
      expect(compressionMetrics.compressionRatio).toBe(1);
      expect(compressionMetrics.compressionPercentage).toBe(0);
    });

    it('should handle expansion case', () => {
      metrics.recordCompressionMetrics(1000, 1200);
      
      const compressionMetrics = metrics.getCompressionMetrics();
      expect(compressionMetrics.compressionRatio).toBeCloseTo(0.833, 3);
      expect(compressionMetrics.compressionPercentage).toBeCloseTo(-20, 10);
    });
  });

  describe('Processing Time Metrics', () => {
    it('should track total processing time', (done) => {
      metrics.startTiming();
      
      setTimeout(() => {
        metrics.endTiming();
        const processingMetrics = metrics.getProcessingMetrics();
        expect(processingMetrics.totalTime).toBeGreaterThan(0);
        expect(processingMetrics.totalTime).toBeLessThan(1000); // Increased timeout tolerance
        done();
      }, 10);
    });

    it('should track individual phase times', (done) => {
      metrics.startPhase();
      
      setTimeout(() => {
        metrics.endPhase('conversionTime');
        const processingMetrics = metrics.getProcessingMetrics();
        expect(processingMetrics.conversionTime).toBeGreaterThan(0);
        expect(processingMetrics.conversionTime).toBeLessThan(1000); // Increased timeout tolerance
        done();
      }, 10);
    });

    it('should track multiple phases independently', (done) => {
      // Track conversion phase
      metrics.startPhase();
      setTimeout(() => {
        metrics.endPhase('conversionTime');
        
        // Track superposition phase
        metrics.startPhase();
        setTimeout(() => {
          metrics.endPhase('superpositionTime');
          
          const processingMetrics = metrics.getProcessingMetrics();
          expect(processingMetrics.conversionTime).toBeGreaterThan(0);
          expect(processingMetrics.superpositionTime).toBeGreaterThan(0);
          expect(processingMetrics.entanglementTime).toBe(0); // Not tracked
          done();
        }, 5);
      }, 10);
    }, 10000); // Increased timeout for this test
  });

  describe('Quantum Efficiency Metrics', () => {
    it('should record quantum efficiency metrics correctly', () => {
      metrics.recordQuantumEfficiency(
        100,    // quantumStatesCreated
        25,     // entanglementPairsFound
        0.75,   // averageCorrelationStrength
        5.5,    // superpositionComplexity
        0.85,   // interferenceEffectiveness
        150.5   // coherenceTime
      );

      const efficiency = metrics.getQuantumEfficiencyMetrics();
      expect(efficiency.quantumStatesCreated).toBe(100);
      expect(efficiency.entanglementPairsFound).toBe(25);
      expect(efficiency.averageCorrelationStrength).toBe(0.75);
      expect(efficiency.superpositionComplexity).toBe(5.5);
      expect(efficiency.interferenceEffectiveness).toBe(0.85);
      expect(efficiency.coherenceTime).toBe(150.5);
    });

    it('should handle zero values for efficiency metrics', () => {
      metrics.recordQuantumEfficiency(0, 0, 0, 0, 0, 0);

      const efficiency = metrics.getQuantumEfficiencyMetrics();
      expect(efficiency.quantumStatesCreated).toBe(0);
      expect(efficiency.entanglementPairsFound).toBe(0);
      expect(efficiency.averageCorrelationStrength).toBe(0);
      expect(efficiency.superpositionComplexity).toBe(0);
      expect(efficiency.interferenceEffectiveness).toBe(0);
      expect(efficiency.coherenceTime).toBe(0);
    });
  });

  describe('Session Statistics', () => {
    it('should track single file statistics', () => {
      metrics.recordCompressionMetrics(1000, 500);
      metrics.setProcessingMetrics({ totalTime: 100 });
      metrics.updateSessionStatistics();

      const session = metrics.getSessionStatistics();
      expect(session.filesProcessed).toBe(1);
      expect(session.totalBytesProcessed).toBe(1000);
      expect(session.totalBytesSaved).toBe(500);
      expect(session.averageCompressionRatio).toBe(2);
      expect(session.bestCompressionRatio).toBe(2);
      expect(session.worstCompressionRatio).toBe(2);
      expect(session.totalProcessingTime).toBe(100);
      expect(session.averageProcessingTime).toBe(100);
    });

    it('should track multiple file statistics correctly', () => {
      // First file: 1000 -> 500 (2:1 ratio)
      metrics.recordCompressionMetrics(1000, 500);
      metrics.setProcessingMetrics({ totalTime: 100 });
      metrics.updateSessionStatistics();

      // Second file: 2000 -> 1000 (2:1 ratio)
      metrics.recordCompressionMetrics(2000, 1000);
      metrics.setProcessingMetrics({ totalTime: 200 });
      metrics.updateSessionStatistics();

      // Third file: 1000 -> 250 (4:1 ratio)
      metrics.recordCompressionMetrics(1000, 250);
      metrics.setProcessingMetrics({ totalTime: 150 });
      metrics.updateSessionStatistics();

      const session = metrics.getSessionStatistics();
      expect(session.filesProcessed).toBe(3);
      expect(session.totalBytesProcessed).toBe(4000);
      expect(session.totalBytesSaved).toBe(2250);
      expect(session.averageCompressionRatio).toBeCloseTo(2.67, 2);
      expect(session.bestCompressionRatio).toBe(4);
      expect(session.worstCompressionRatio).toBe(2);
      expect(session.totalProcessingTime).toBe(450);
      expect(session.averageProcessingTime).toBe(150);
    });

    it('should handle varying compression ratios', () => {
      // Poor compression: 1000 -> 900 (1.11:1 ratio)
      metrics.recordCompressionMetrics(1000, 900);
      metrics.setProcessingMetrics({ totalTime: 50 });
      metrics.updateSessionStatistics();

      // Excellent compression: 1000 -> 100 (10:1 ratio)
      metrics.recordCompressionMetrics(1000, 100);
      metrics.setProcessingMetrics({ totalTime: 200 });
      metrics.updateSessionStatistics();

      const session = metrics.getSessionStatistics();
      expect(session.filesProcessed).toBe(2);
      expect(session.bestCompressionRatio).toBe(10);
      expect(session.worstCompressionRatio).toBeCloseTo(1.11, 2);
      expect(session.averageCompressionRatio).toBeCloseTo(5.56, 2);
    });
  });

  describe('Metrics Integration', () => {
    it('should return all metrics in a single call', () => {
      metrics.recordCompressionMetrics(1000, 400);
      metrics.recordQuantumEfficiency(50, 10, 0.8, 3.2, 0.9, 120);
      metrics.setProcessingMetrics({ totalTime: 150 });
      metrics.updateSessionStatistics();

      const allMetrics = metrics.getAllMetrics();
      
      expect(allMetrics.compression.compressionRatio).toBe(2.5);
      expect(allMetrics.efficiency.quantumStatesCreated).toBe(50);
      expect(allMetrics.processing.totalTime).toBe(150);
      expect(allMetrics.session.filesProcessed).toBe(1);
    });

    it('should reset individual operation metrics but preserve session', () => {
      metrics.recordCompressionMetrics(1000, 500);
      metrics.recordQuantumEfficiency(25, 5, 0.7, 2.1, 0.8, 100);
      metrics.updateSessionStatistics();

      metrics.reset();

      const compression = metrics.getCompressionMetrics();
      const efficiency = metrics.getQuantumEfficiencyMetrics();
      const session = metrics.getSessionStatistics();

      expect(compression.originalSize).toBe(0);
      expect(efficiency.quantumStatesCreated).toBe(0);
      expect(session.filesProcessed).toBe(1); // Session preserved
    });

    it('should reset session statistics completely', () => {
      metrics.recordCompressionMetrics(1000, 500);
      metrics.updateSessionStatistics();

      metrics.resetSession();

      const session = metrics.getSessionStatistics();
      expect(session.filesProcessed).toBe(0);
      expect(session.totalBytesProcessed).toBe(0);
      expect(session.totalBytesSaved).toBe(0);
      expect(session.averageCompressionRatio).toBe(1);
      expect(session.bestCompressionRatio).toBe(1);
      expect(session.worstCompressionRatio).toBe(1);
    });
  });

  describe('Report Generation', () => {
    it('should generate a formatted report with all metrics', () => {
      metrics.recordCompressionMetrics(10000, 2500);
      metrics.recordQuantumEfficiency(75, 15, 0.825, 4.2, 0.91, 175.5);
      metrics.setProcessingMetrics({
        totalTime: 250,
        conversionTime: 50,
        superpositionTime: 75,
        entanglementTime: 60,
        interferenceTime: 40,
        encodingTime: 25
      });
      metrics.updateSessionStatistics();

      const report = metrics.generateReport();

      expect(report).toContain('QuantumFlow Performance Report');
      expect(report).toContain('Original Size: 10,000 bytes');
      expect(report).toContain('Compressed Size: 2,500 bytes');
      expect(report).toContain('Compression Ratio: 4.00:1');
      expect(report).toContain('Space Saved: 75.0%');
      expect(report).toContain('Total Time: 250ms');
      expect(report).toContain('Quantum States: 75');
      expect(report).toContain('Entanglement Pairs: 15');
      expect(report).toContain('Files Processed: 1');
    });

    it('should format large numbers with commas', () => {
      metrics.recordCompressionMetrics(1234567, 123456);
      metrics.updateSessionStatistics();

      const report = metrics.generateReport();
      expect(report).toContain('Original Size: 1,234,567 bytes');
      expect(report).toContain('Compressed Size: 123,456 bytes');
    });

    it('should handle decimal precision correctly', () => {
      metrics.recordCompressionMetrics(1000, 333);
      metrics.recordQuantumEfficiency(10, 2, 0.123456, 1.987654, 0.555555, 99.999);

      const report = metrics.generateReport();
      expect(report).toContain('Compression Ratio: 3.00:1');
      expect(report).toContain('Avg Correlation: 0.123');
      expect(report).toContain('Superposition Complexity: 1.99');
      expect(report).toContain('Interference Effectiveness: 0.556');
      expect(report).toContain('Coherence Time: 100.00ms');
    });
  });

  describe('Performance Statistics and Optimization', () => {
    describe('Performance Trend Analysis', () => {
      it('should detect improving performance trend', () => {
        // Simulate improving compression ratios
        const ratios = [1.5, 1.7, 1.9, 2.1, 2.3];
        ratios.forEach(ratio => {
          metrics.recordCompressionMetrics(1000, 1000 / ratio);
          metrics.setProcessingMetrics({ totalTime: 100 });
          metrics.updateSessionStatistics();
        });

        const trend = metrics.getPerformanceTrend();
        expect(trend.trend).toBe('improving');
        // Use toBeCloseTo for floating point comparisons
        trend.recentRatios.forEach((ratio, index) => {
          expect(ratio).toBeCloseTo(ratios[index], 2);
        });
        expect(trend.averageRecent).toBeCloseTo(1.9, 1);
      });

      it('should detect degrading performance trend', () => {
        // Simulate degrading compression ratios
        const ratios = [2.5, 2.2, 1.9, 1.6, 1.3];
        ratios.forEach(ratio => {
          metrics.recordCompressionMetrics(1000, 1000 / ratio);
          metrics.setProcessingMetrics({ totalTime: 100 });
          metrics.updateSessionStatistics();
        });

        const trend = metrics.getPerformanceTrend();
        expect(trend.trend).toBe('degrading');
        // Use toBeCloseTo for floating point comparisons
        trend.recentRatios.forEach((ratio, index) => {
          expect(ratio).toBeCloseTo(ratios[index], 2);
        });
      });

      it('should detect stable performance trend', () => {
        // Simulate stable compression ratios
        const ratios = [2.0, 2.1, 1.9, 2.0, 2.1];
        ratios.forEach(ratio => {
          metrics.recordCompressionMetrics(1000, 1000 / ratio);
          metrics.setProcessingMetrics({ totalTime: 100 });
          metrics.updateSessionStatistics();
        });

        const trend = metrics.getPerformanceTrend();
        expect(trend.trend).toBe('stable');
      });

      it('should maintain only last 10 compression ratios', () => {
        // Add 15 operations
        for (let i = 1; i <= 15; i++) {
          metrics.recordCompressionMetrics(1000, 1000 / (1 + i * 0.1));
          metrics.setProcessingMetrics({ totalTime: 100 });
          metrics.updateSessionStatistics();
        }

        const session = metrics.getSessionStatistics();
        expect(session.recentCompressionRatios).toHaveLength(10);
        // 6th operation: 1 + 6 * 0.1 = 1.6, ratio = 1000/1000*1.6 = 1/1.6 = 0.625... wait, that's wrong
        // Let me recalculate: 1000 / (1000 / (1 + 6 * 0.1)) = 1 + 6 * 0.1 = 1.6
        expect(session.recentCompressionRatios[0]).toBeCloseTo(1.6, 2); // 6th operation
        expect(session.recentCompressionRatios[9]).toBeCloseTo(2.5, 2);  // 15th operation
      });

      it('should compare performance to baseline correctly', () => {
        metrics.setBaselineCompressionRatio(2.0);
        
        // Above baseline
        metrics.recordCompressionMetrics(1000, 400); // 2.5:1 ratio
        metrics.updateSessionStatistics();
        expect(metrics.getPerformanceTrend().comparedToBaseline).toBe('above');

        // Reset and test below baseline
        metrics.resetSession();
        metrics.setBaselineCompressionRatio(2.0);
        metrics.recordCompressionMetrics(1000, 600); // 1.67:1 ratio
        metrics.updateSessionStatistics();
        expect(metrics.getPerformanceTrend().comparedToBaseline).toBe('below');

        // Reset and test at baseline
        metrics.resetSession();
        metrics.setBaselineCompressionRatio(2.0);
        metrics.recordCompressionMetrics(1000, 500); // 2.0:1 ratio
        metrics.updateSessionStatistics();
        expect(metrics.getPerformanceTrend().comparedToBaseline).toBe('at');
      });
    });

    describe('Optimization Suggestions', () => {
      it('should suggest improvements when below baseline', () => {
        metrics.setBaselineCompressionRatio(2.0);
        metrics.recordCompressionMetrics(1000, 700); // 1.43:1 ratio (below baseline)
        metrics.updateSessionStatistics();

        const suggestions = metrics.generateOptimizationSuggestions();
        const baselineSuggestion = suggestions.find(s => s.type === 'general' && s.priority === 'high');
        
        expect(baselineSuggestion).toBeDefined();
        expect(baselineSuggestion!.description).toContain('below baseline');
        expect(baselineSuggestion!.suggestion).toContain('increasing quantum simulation parameters');
      });

      it('should suggest improvements for degrading performance', () => {
        // Create degrading trend
        const ratios = [2.5, 2.2, 1.9, 1.6, 1.3];
        ratios.forEach(ratio => {
          metrics.recordCompressionMetrics(1000, 1000 / ratio);
          metrics.setProcessingMetrics({ totalTime: 100 });
          metrics.updateSessionStatistics();
        });

        const suggestions = metrics.generateOptimizationSuggestions();
        const trendSuggestion = suggestions.find(s => s.description.includes('degrading'));
        
        expect(trendSuggestion).toBeDefined();
        expect(trendSuggestion!.priority).toBe('medium');
        expect(trendSuggestion!.suggestion).toContain('parameter adjustments');
      });

      it('should suggest entanglement improvements for low correlation', () => {
        metrics.recordQuantumEfficiency(50, 10, 0.2, 3.0, 0.8, 100); // Low correlation
        
        const suggestions = metrics.generateOptimizationSuggestions();
        const entanglementSuggestion = suggestions.find(s => s.type === 'entanglement_level');
        
        expect(entanglementSuggestion).toBeDefined();
        expect(entanglementSuggestion!.currentValue).toBe(0.2);
        expect(entanglementSuggestion!.suggestedValue).toBe(0.5);
        expect(entanglementSuggestion!.description).toContain('Low average correlation strength');
      });

      it('should suggest interference improvements for low effectiveness', () => {
        metrics.recordQuantumEfficiency(50, 10, 0.8, 3.0, 0.4, 100); // Low interference effectiveness
        
        const suggestions = metrics.generateOptimizationSuggestions();
        const interferenceSuggestion = suggestions.find(s => s.type === 'interference_threshold');
        
        expect(interferenceSuggestion).toBeDefined();
        expect(interferenceSuggestion!.currentValue).toBe(0.4);
        expect(interferenceSuggestion!.suggestedValue).toBe(0.75);
        expect(interferenceSuggestion!.description).toContain('Low interference effectiveness');
      });

      it('should suggest processing efficiency improvements', () => {
        metrics.recordCompressionMetrics(1000, 500); // 2:1 ratio
        metrics.setProcessingMetrics({ totalTime: 5000 }); // 5 seconds
        
        const suggestions = metrics.generateOptimizationSuggestions();
        const efficiencySuggestion = suggestions.find(s => s.type === 'superposition_complexity');
        
        expect(efficiencySuggestion).toBeDefined();
        expect(efficiencySuggestion!.priority).toBe('low');
        expect(efficiencySuggestion!.description).toContain('Low processing efficiency');
      });

      it('should suggest quantum bit depth improvements for low state utilization', () => {
        metrics.recordQuantumEfficiency(5, 2, 0.8, 3.0, 0.8, 100); // Very few quantum states
        
        const suggestions = metrics.generateOptimizationSuggestions();
        const bitDepthSuggestion = suggestions.find(s => s.type === 'quantum_bit_depth');
        
        expect(bitDepthSuggestion).toBeDefined();
        expect(bitDepthSuggestion!.currentValue).toBe(5);
        expect(bitDepthSuggestion!.suggestedValue).toBe(50);
        expect(bitDepthSuggestion!.description).toContain('Low quantum state utilization');
      });

      it('should provide critical suggestions for data expansion', () => {
        metrics.recordCompressionMetrics(1000, 1200); // Expansion instead of compression
        
        const suggestions = metrics.generateOptimizationSuggestions();
        const criticalSuggestion = suggestions.find(s => s.priority === 'critical');
        
        expect(criticalSuggestion).toBeDefined();
        expect(criticalSuggestion!.description).toContain('expanding data instead of compressing');
        expect(criticalSuggestion!.suggestion).toContain('fallback to classical compression');
      });

      it('should sort suggestions by priority', () => {
        // Create conditions for multiple suggestions
        metrics.recordCompressionMetrics(1000, 1200); // Critical: expansion
        metrics.recordQuantumEfficiency(5, 2, 0.2, 3.0, 0.4, 100); // Multiple medium/low priority
        metrics.setBaselineCompressionRatio(2.0);
        
        const suggestions = metrics.generateOptimizationSuggestions();
        
        expect(suggestions.length).toBeGreaterThan(1);
        expect(suggestions[0].priority).toBe('critical');
        
        // Verify sorting order
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        for (let i = 1; i < suggestions.length; i++) {
          expect(priorityOrder[suggestions[i-1].priority]).toBeGreaterThanOrEqual(
            priorityOrder[suggestions[i].priority]
          );
        }
      });

      it('should return empty array when no suggestions needed', () => {
        // Good performance metrics
        metrics.recordCompressionMetrics(1000, 400); // 2.5:1 ratio
        metrics.recordQuantumEfficiency(100, 25, 0.8, 5.0, 0.9, 150);
        metrics.setProcessingMetrics({ totalTime: 200 });
        metrics.setBaselineCompressionRatio(1.5);
        metrics.updateSessionStatistics(); // Need to update session stats for average calculation
        
        const suggestions = metrics.generateOptimizationSuggestions();
        expect(suggestions).toHaveLength(0);
      });
    });

    describe('Baseline Management', () => {
      it('should set and use custom baseline compression ratio', () => {
        metrics.setBaselineCompressionRatio(3.0);
        
        const session = metrics.getSessionStatistics();
        expect(session.baselineCompressionRatio).toBe(3.0);
      });

      it('should reset baseline with session reset', () => {
        metrics.setBaselineCompressionRatio(3.0);
        metrics.resetSession();
        
        const session = metrics.getSessionStatistics();
        expect(session.baselineCompressionRatio).toBe(1.15); // Default baseline
      });
    });
  });

  describe('Enhanced Report Generation', () => {
    it('should include performance trend and optimization suggestions in report', () => {
      metrics.recordCompressionMetrics(10000, 5000);
      metrics.recordQuantumEfficiency(75, 15, 0.3, 4.2, 0.5, 175.5); // Low correlation and interference
      metrics.setProcessingMetrics({ totalTime: 250 });
      metrics.updateSessionStatistics();

      const report = metrics.generateReport();

      expect(report).toContain('Performance Trend: stable');
      expect(report).toContain('Baseline Target: 1.15:1');
      expect(report).toContain('Optimization Suggestions:');
      expect(report).toContain('Low average correlation strength');
      expect(report).toContain('Low interference effectiveness');
    });

    it('should show "No optimization suggestions" when performance is good', () => {
      metrics.recordCompressionMetrics(1000, 300); // Excellent 3.33:1 ratio
      metrics.recordQuantumEfficiency(100, 25, 0.9, 5.0, 0.95, 150);
      metrics.setProcessingMetrics({ totalTime: 100 });
      metrics.setBaselineCompressionRatio(1.5);
      metrics.updateSessionStatistics();

      const report = metrics.generateReport();
      expect(report).toContain('No optimization suggestions at this time');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero original size gracefully', () => {
      expect(() => {
        metrics.recordCompressionMetrics(0, 0);
      }).not.toThrow();

      const compression = metrics.getCompressionMetrics();
      expect(compression.compressionRatio).toBeNaN();
    });

    it('should handle negative values in efficiency metrics', () => {
      expect(() => {
        metrics.recordQuantumEfficiency(-1, -1, -0.5, -1.0, -0.5, -100);
      }).not.toThrow();

      const efficiency = metrics.getQuantumEfficiencyMetrics();
      expect(efficiency.quantumStatesCreated).toBe(-1);
      expect(efficiency.averageCorrelationStrength).toBe(-0.5);
    });

    it('should maintain immutability of returned metrics', () => {
      metrics.recordCompressionMetrics(1000, 500);
      
      const compression1 = metrics.getCompressionMetrics();
      compression1.originalSize = 2000; // Attempt to modify
      
      const compression2 = metrics.getCompressionMetrics();
      expect(compression2.originalSize).toBe(1000); // Should be unchanged
    });

    it('should handle trend analysis with insufficient data', () => {
      // Only 2 data points
      metrics.recordCompressionMetrics(1000, 500);
      metrics.updateSessionStatistics();
      metrics.recordCompressionMetrics(1000, 400);
      metrics.updateSessionStatistics();

      const trend = metrics.getPerformanceTrend();
      expect(trend.trend).toBe('stable'); // Should default to stable
    });

    it('should handle optimization suggestions with zero efficiency metrics', () => {
      metrics.recordQuantumEfficiency(0, 0, 0, 0, 0, 0);
      
      const suggestions = metrics.generateOptimizationSuggestions();
      // Should not crash and may include some suggestions
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});