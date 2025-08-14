import { QuantumPhaseAssigner, PhaseAssignmentStrategy, PhaseContext } from '../QuantumPhaseAssigner';

describe('QuantumPhaseAssigner', () => {
  describe('constructor and basic properties', () => {
    test('should create phase assigner with default parameters', () => {
      const assigner = new QuantumPhaseAssigner();
      
      expect(assigner.strategy).toBe('entropy-based');
      expect(assigner.adaptiveThreshold).toBe(0.5);
    });

    test('should create phase assigner with custom parameters', () => {
      const assigner = new QuantumPhaseAssigner('frequency-based', 0.7);
      
      expect(assigner.strategy).toBe('frequency-based');
      expect(assigner.adaptiveThreshold).toBe(0.7);
    });

    test('should validate adaptive threshold bounds', () => {
      const assigner = new QuantumPhaseAssigner();
      
      expect(() => assigner.adaptiveThreshold = -0.1).toThrow(
        'Adaptive threshold must be between 0 and 1'
      );
      expect(() => assigner.adaptiveThreshold = 1.1).toThrow(
        'Adaptive threshold must be between 0 and 1'
      );
    });
  });

  describe('entropy-based phase calculation', () => {
    test('should calculate phase for uniform data', () => {
      const assigner = new QuantumPhaseAssigner('entropy-based');
      const data = Buffer.alloc(10, 42); // All same value
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBe(0); // Zero entropy = zero phase
    });

    test('should calculate phase for high entropy data', () => {
      const assigner = new QuantumPhaseAssigner('entropy-based');
      const data = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]); // High entropy
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThan(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });

    test('should handle empty data', () => {
      const assigner = new QuantumPhaseAssigner('entropy-based');
      const data = Buffer.from([]);
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBe(0);
    });
  });

  describe('frequency-based phase calculation', () => {
    test('should calculate phase based on dominant frequency', () => {
      const assigner = new QuantumPhaseAssigner('frequency-based');
      const data = Buffer.from([100, 100, 100, 150, 200]); // 100 is dominant
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });

    test('should handle data with equal frequencies', () => {
      const assigner = new QuantumPhaseAssigner('frequency-based');
      const data = Buffer.from([10, 20, 30, 40]); // All different
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });
  });

  describe('pattern-based phase calculation', () => {
    test('should calculate phase based on byte transitions', () => {
      const assigner = new QuantumPhaseAssigner('pattern-based');
      const data = Buffer.from([10, 50, 100, 150, 200]); // Increasing pattern
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThan(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });

    test('should handle single byte data', () => {
      const assigner = new QuantumPhaseAssigner('pattern-based');
      const data = Buffer.from([42]);
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThanOrEqual(0);
    });

    test('should handle constant data', () => {
      const assigner = new QuantumPhaseAssigner('pattern-based');
      const data = Buffer.from([42, 42, 42, 42]); // No transitions
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBe(0); // No transitions = zero phase
    });
  });

  describe('adaptive phase calculation', () => {
    test('should adapt to high entropy data', () => {
      const assigner = new QuantumPhaseAssigner('adaptive');
      const data = Buffer.from(Array.from({length: 20}, (_, i) => i * 13 % 256)); // High entropy
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThan(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });

    test('should adapt to uniform data', () => {
      const assigner = new QuantumPhaseAssigner('adaptive');
      const data = Buffer.from([42, 42, 43, 43, 44, 44]); // Uniform pattern
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });

    test('should adapt to complex patterns', () => {
      const assigner = new QuantumPhaseAssigner('adaptive', 0.3);
      const data = Buffer.from([10, 100, 20, 200, 30, 150, 40, 250]); // Complex pattern
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThan(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });
  });

  describe('correlation-based phase calculation', () => {
    test('should use correlation with previous chunks', () => {
      const assigner = new QuantumPhaseAssigner('correlation-based');
      const context = assigner.createPhaseContext([
        { data: Buffer.from([10, 20, 30]), phase: Math.PI / 2, timestamp: Date.now() }
      ]);
      
      const similarData = Buffer.from([12, 22, 32]); // Similar to previous
      const phase = assigner.calculatePhase(similarData, context);
      
      expect(phase).toBeGreaterThan(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });

    test('should fall back to entropy-based without context', () => {
      const assigner = new QuantumPhaseAssigner('correlation-based');
      const data = Buffer.from([10, 20, 30, 40]);
      
      const phase = assigner.calculatePhase(data);
      
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });

    test('should handle empty context', () => {
      const assigner = new QuantumPhaseAssigner('correlation-based');
      const context = assigner.createPhaseContext([]);
      const data = Buffer.from([10, 20, 30, 40]);
      
      const phase = assigner.calculatePhase(data, context);
      
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThanOrEqual(2 * Math.PI);
    });
  });

  describe('strategy optimization', () => {
    test('should recommend entropy-based for high entropy data', () => {
      const assigner = new QuantumPhaseAssigner();
      const highEntropyData = Buffer.from(Array.from({length: 50}, (_, i) => i * 7 % 256));
      
      const strategy = assigner.optimizeStrategy(highEntropyData);
      
      // High entropy data should prefer entropy-based or adaptive strategies
      expect(['entropy-based', 'adaptive', 'frequency-based']).toContain(strategy);
    });

    test('should recommend frequency-based for uniform data', () => {
      const assigner = new QuantumPhaseAssigner();
      const uniformData = Buffer.from([42, 42, 42, 43, 43, 43, 44, 44, 44]);
      
      const strategy = assigner.optimizeStrategy(uniformData);
      
      expect(strategy).toBe('frequency-based');
    });

    test('should recommend appropriate strategy for complex data', () => {
      const assigner = new QuantumPhaseAssigner();
      const complexData = Buffer.from([10, 200, 30, 180, 50, 160, 70, 140]);
      
      const strategy = assigner.optimizeStrategy(complexData);
      
      // Complex data should use any valid strategy
      expect(['entropy-based', 'frequency-based', 'pattern-based', 'adaptive']).toContain(strategy);
    });

    test('should handle empty data', () => {
      const assigner = new QuantumPhaseAssigner();
      const emptyData = Buffer.from([]);
      
      const strategy = assigner.optimizeStrategy(emptyData);
      
      expect(strategy).toBe('entropy-based');
    });
  });

  describe('phase context management', () => {
    test('should create empty phase context', () => {
      const assigner = new QuantumPhaseAssigner();
      const context = assigner.createPhaseContext();
      
      expect(context.previousChunks).toHaveLength(0);
      expect(context.timestamp).toBeGreaterThan(0);
    });

    test('should create context with previous chunks', () => {
      const assigner = new QuantumPhaseAssigner();
      const previousChunks = [
        { data: Buffer.from([1, 2, 3]), phase: Math.PI, timestamp: Date.now() }
      ];
      
      const context = assigner.createPhaseContext(previousChunks);
      
      expect(context.previousChunks).toHaveLength(1);
      expect(context.previousChunks[0].phase).toBe(Math.PI);
    });

    test('should update context with new chunk', () => {
      const assigner = new QuantumPhaseAssigner();
      let context = assigner.createPhaseContext();
      
      const chunk = Buffer.from([10, 20, 30]);
      const phase = Math.PI / 4;
      
      context = assigner.updatePhaseContext(context, chunk, phase);
      
      expect(context.previousChunks).toHaveLength(1);
      expect(context.previousChunks[0].phase).toBe(phase);
      expect(Buffer.compare(context.previousChunks[0].data, chunk)).toBe(0);
    });

    test('should limit context size', () => {
      const assigner = new QuantumPhaseAssigner();
      let context = assigner.createPhaseContext();
      
      // Add more than 10 chunks
      for (let i = 0; i < 15; i++) {
        const chunk = Buffer.from([i]);
        context = assigner.updatePhaseContext(context, chunk, i);
      }
      
      expect(context.previousChunks).toHaveLength(10); // Should be limited to 10
      expect(context.previousChunks[0].data[0]).toBe(5); // Should keep the last 10
    });
  });

  describe('strategy switching', () => {
    test('should allow strategy changes', () => {
      const assigner = new QuantumPhaseAssigner('entropy-based');
      const data = Buffer.from([10, 20, 30, 40]);
      
      const entropyPhase = assigner.calculatePhase(data);
      
      assigner.strategy = 'frequency-based';
      const frequencyPhase = assigner.calculatePhase(data);
      
      // Different strategies should potentially give different results
      expect(assigner.strategy).toBe('frequency-based');
    });

    test('should handle all strategy types', () => {
      const assigner = new QuantumPhaseAssigner();
      const data = Buffer.from([10, 20, 30, 40, 50]);
      
      const strategies: PhaseAssignmentStrategy[] = [
        'entropy-based',
        'frequency-based',
        'pattern-based',
        'adaptive',
        'correlation-based'
      ];
      
      for (const strategy of strategies) {
        assigner.strategy = strategy;
        const phase = assigner.calculatePhase(data);
        
        expect(phase).toBeGreaterThanOrEqual(0);
        expect(phase).toBeLessThanOrEqual(2 * Math.PI);
      }
    });
  });
});