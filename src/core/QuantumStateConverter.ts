import { QuantumStateVector } from '../models/QuantumStateVector';
import { Complex } from '../math/Complex';
import { QuantumMath } from '../math/QuantumMath';

/**
 * Converts classical data to quantum state vectors and vice versa
 * Implements Hadamard-like transformations for quantum state preparation
 */
export class QuantumStateConverter {
    private _quantumBitDepth: number;
    private _chunkSize: number;

    constructor(quantumBitDepth: number = 8, chunkSize: number = 4) {
        if (quantumBitDepth < 2 || quantumBitDepth > 16) {
            throw new Error('Quantum bit depth must be between 2 and 16');
        }

        if (chunkSize < 1 || chunkSize > 256) {
            throw new Error('Chunk size must be between 1 and 256');
        }

        this._quantumBitDepth = quantumBitDepth;
        this._chunkSize = chunkSize;
    }

    /**
     * Get quantum bit depth
     */
    get quantumBitDepth(): number {
        return this._quantumBitDepth;
    }

    /**
     * Get chunk size
     */
    get chunkSize(): number {
        return this._chunkSize;
    }

    /**
     * Convert Buffer data to array of QuantumStateVector
     */
    convertToQuantumStates(data: Buffer): QuantumStateVector[] {
        if (data.length === 0) {
            throw new Error('Cannot convert empty data to quantum states');
        }

        const quantumStates: QuantumStateVector[] = [];

        // Process data in chunks
        for (let i = 0; i < data.length; i += this._chunkSize) {
            const chunk = data.subarray(i, Math.min(i + this._chunkSize, data.length));
            const quantumState = this.convertChunkToQuantumState(chunk);
            quantumStates.push(quantumState);
        }

        return quantumStates;
    }

    /**
     * Convert array of QuantumStateVector back to Buffer
     */
    convertFromQuantumStates(states: QuantumStateVector[]): Buffer {
        if (states.length === 0) {
            throw new Error('Cannot convert empty quantum states to data');
        }

        const chunks: Buffer[] = [];

        for (const state of states) {
            const chunk = this.convertQuantumStateToChunk(state);
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    }

    /**
     * Convert a single data chunk to quantum state vector
     */
    private convertChunkToQuantumState(chunk: Buffer): QuantumStateVector {
        // Create quantum amplitudes using Hadamard-like transformation
        const amplitudes = this.createQuantumAmplitudes(chunk);

        // Calculate quantum phase from chunk entropy
        const phase = this.calculateChunkPhase(chunk);

        return new QuantumStateVector(amplitudes, phase);
    }

    /**
     * Convert quantum state vector back to data chunk
     */
    private convertQuantumStateToChunk(state: QuantumStateVector): Buffer {
        const bytes: number[] = [];

        // Extract bytes from quantum amplitudes
        for (let i = 0; i < Math.min(state.amplitudes.length, this._chunkSize); i++) {
            const amplitude = state.amplitudes[i];
            const byte = this.extractByteFromAmplitude(amplitude, state.phase);
            bytes.push(byte);
        }

        return Buffer.from(bytes);
    }

    /**
     * Create quantum amplitudes from data chunk using Hadamard-like transformations
     */
    private createQuantumAmplitudes(chunk: Buffer): Complex[] {
        const amplitudes: Complex[] = [];
        const maxAmplitudes = Math.pow(2, Math.min(this._quantumBitDepth, 8)); // Limit for performance

        // Process each byte in the chunk
        for (let i = 0; i < chunk.length && amplitudes.length < maxAmplitudes; i++) {
            const byte = chunk[i];

            // Apply Hadamard-like transformation to create superposition
            const baseAmplitudes = this.applyHadamardTransformation(byte);
            amplitudes.push(...baseAmplitudes);
        }

        // Pad with zero amplitudes if needed
        while (amplitudes.length < Math.min(this._chunkSize * 2, maxAmplitudes)) {
            amplitudes.push(new Complex(0, 0));
        }

        // Normalize the amplitudes
        return QuantumMath.normalizeAmplitudes(amplitudes);
    }

    /**
     * Apply Hadamard-like transformation to a byte value
     */
    private applyHadamardTransformation(byte: number): Complex[] {
        // Convert byte to binary representation
        const binaryString = byte.toString(2).padStart(8, '0');

        // Create base amplitude from byte value
        const magnitude = (byte + 1) / 256; // Avoid zero magnitude
        const phase = QuantumMath.calculateQuantumPhase(byte);
        const baseAmplitude = Complex.fromPolar(magnitude, phase);

        // Apply Hadamard transformation to create superposition
        let currentAmplitudes = [baseAmplitude];

        // Apply transformation for each bit (limited by quantum bit depth)
        const bitsToProcess = Math.min(binaryString.length, this._quantumBitDepth);

        for (let i = 0; i < bitsToProcess; i++) {
            const bit = parseInt(binaryString[i]);
            const newAmplitudes: Complex[] = [];

            for (const amp of currentAmplitudes) {
                if (bit === 0) {
                    // |0⟩ state: apply identity-like transformation
                    const [amp1, amp2] = QuantumMath.hadamardTransform(amp);
                    newAmplitudes.push(amp1, amp2);
                } else {
                    // |1⟩ state: apply phase-shifted transformation
                    const phaseShift = Math.PI / 4; // 45-degree phase shift
                    const shiftedAmp = amp.multiply(Complex.fromPolar(1, phaseShift));
                    const [amp1, amp2] = QuantumMath.hadamardTransform(shiftedAmp);
                    newAmplitudes.push(amp1, amp2);
                }
            }

            currentAmplitudes = newAmplitudes;

            // Limit amplitude explosion for performance
            if (currentAmplitudes.length > 64) {
                break;
            }
        }

        return currentAmplitudes.slice(0, 4); // Return up to 4 amplitudes per byte
    }

    /**
     * Calculate quantum phase from chunk data
     */
    private calculateChunkPhase(chunk: Buffer): number {
        // Calculate entropy-based phase
        const frequencies = new Array(256).fill(0);

        for (const byte of chunk) {
            frequencies[byte]++;
        }

        const probabilities = frequencies.map(freq => freq / chunk.length);
        const entropy = QuantumMath.calculateEntropy(probabilities);

        // Map entropy to phase (0 to 2π)
        return (entropy / 8) * 2 * Math.PI; // Max entropy for byte is 8 bits
    }

    /**
     * Extract byte value from quantum amplitude and phase
     */
    private extractByteFromAmplitude(amplitude: Complex, globalPhase: number): number {
        // Combine amplitude information with global phase
        const magnitude = amplitude.magnitude();
        const localPhase = amplitude.phase();
        const combinedPhase = (localPhase + globalPhase) % (2 * Math.PI);

        // Convert back to byte value
        const normalizedMagnitude = Math.min(1, Math.max(0, magnitude));
        const normalizedPhase = combinedPhase / (2 * Math.PI);

        // Combine magnitude and phase information
        const byteValue = Math.round(
            (normalizedMagnitude * 128) + (normalizedPhase * 127)
        ) % 256;

        return Math.max(0, Math.min(255, byteValue));
    }

    /**
     * Analyze data patterns for optimal quantum representation
     */
    analyzeDataPatterns(data: Buffer): DataPatternAnalysis {
        const analysis: DataPatternAnalysis = {
            entropy: 0,
            repetitionRate: 0,
            byteFrequencies: new Array(256).fill(0),
            recommendedChunkSize: this._chunkSize,
            recommendedBitDepth: this._quantumBitDepth,
            patternComplexity: 0
        };

        if (data.length === 0) {
            return analysis;
        }

        // Calculate byte frequencies
        for (const byte of data) {
            analysis.byteFrequencies[byte]++;
        }

        // Calculate entropy
        const probabilities = analysis.byteFrequencies.map(freq => freq / data.length);
        analysis.entropy = QuantumMath.calculateEntropy(probabilities);

        // Calculate repetition rate
        const uniqueBytes = analysis.byteFrequencies.filter(freq => freq > 0).length;
        analysis.repetitionRate = 1 - (uniqueBytes / 256);

        // Calculate pattern complexity
        analysis.patternComplexity = this.calculatePatternComplexity(data);

        // Recommend optimal parameters
        analysis.recommendedChunkSize = this.recommendChunkSize(analysis);
        analysis.recommendedBitDepth = this.recommendBitDepth(analysis);

        return analysis;
    }

    /**
     * Calculate pattern complexity of data
     */
    private calculatePatternComplexity(data: Buffer): number {
        if (data.length < 2) return 0;

        let complexity = 0;
        const windowSize = Math.min(8, data.length);

        // Analyze local patterns
        for (let i = 0; i <= data.length - windowSize; i++) {
            const window = data.subarray(i, i + windowSize);
            const windowEntropy = this.calculateWindowEntropy(window);
            complexity += windowEntropy;
        }

        return complexity / (data.length - windowSize + 1);
    }

    /**
     * Calculate entropy of a data window
     */
    private calculateWindowEntropy(window: Buffer): number {
        const frequencies = new Array(256).fill(0);

        for (const byte of window) {
            frequencies[byte]++;
        }

        const probabilities = frequencies.map(freq => freq / window.length);
        return QuantumMath.calculateEntropy(probabilities);
    }

    /**
     * Recommend optimal chunk size based on data analysis
     */
    private recommendChunkSize(analysis: DataPatternAnalysis): number {
        // Higher entropy suggests larger chunks for better compression
        if (analysis.entropy > 6) {
            return Math.min(8, this._chunkSize * 2);
        }

        // Lower entropy suggests smaller chunks
        if (analysis.entropy < 3) {
            return Math.max(2, Math.floor(this._chunkSize / 2));
        }

        return this._chunkSize;
    }

    /**
     * Recommend optimal bit depth based on data analysis
     */
    private recommendBitDepth(analysis: DataPatternAnalysis): number {
        // High complexity data benefits from higher bit depth
        if (analysis.patternComplexity > 5) {
            return Math.min(12, this._quantumBitDepth + 2);
        }

        // Low complexity data can use lower bit depth
        if (analysis.patternComplexity < 2) {
            return Math.max(4, this._quantumBitDepth - 2);
        }

        return this._quantumBitDepth;
    }

    /**
     * Optimize converter parameters based on data analysis
     */
    optimizeForData(data: Buffer): QuantumStateConverter {
        const analysis = this.analyzeDataPatterns(data);

        return new QuantumStateConverter(
            analysis.recommendedBitDepth,
            analysis.recommendedChunkSize
        );
    }

    /**
     * Get conversion statistics
     */
    getConversionStats(originalSize: number, quantumStates: QuantumStateVector[]): ConversionStats {
        const totalAmplitudes = quantumStates.reduce(
            (sum, state) => sum + state.amplitudes.length,
            0
        );

        const averageAmplitudesPerState = totalAmplitudes / quantumStates.length;
        const estimatedQuantumSize = totalAmplitudes * 16; // Complex numbers = 16 bytes each

        return {
            originalSize,
            quantumStateCount: quantumStates.length,
            totalAmplitudes,
            averageAmplitudesPerState,
            estimatedQuantumSize,
            expansionRatio: estimatedQuantumSize / originalSize,
            chunksProcessed: quantumStates.length,
            averageChunkSize: originalSize / quantumStates.length
        };
    }
}

/**
 * Interface for data pattern analysis results
 */
export interface DataPatternAnalysis {
    entropy: number;
    repetitionRate: number;
    byteFrequencies: number[];
    recommendedChunkSize: number;
    recommendedBitDepth: number;
    patternComplexity: number;
}

/**
 * Interface for conversion statistics
 */
export interface ConversionStats {
    originalSize: number;
    quantumStateCount: number;
    totalAmplitudes: number;
    averageAmplitudesPerState: number;
    estimatedQuantumSize: number;
    expansionRatio: number;
    chunksProcessed: number;
    averageChunkSize: number;
}