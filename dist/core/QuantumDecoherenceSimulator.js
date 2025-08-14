"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumDecoherenceSimulator = void 0;
const QuantumStateVector_1 = require("../models/QuantumStateVector");
const SuperpositionState_1 = require("../models/SuperpositionState");
const Complex_1 = require("../math/Complex");
const QuantumMath_1 = require("../math/QuantumMath");
/**
 * Simulates quantum decoherence effects on quantum states
 * Tracks coherence time degradation and applies realistic quantum noise
 */
class QuantumDecoherenceSimulator {
    constructor(baseCoherenceTime = 100.0, decoherenceRate = 0.01, environmentalNoise = 0.001, temperatureEffect = 0.1) {
        this._baseCoherenceTime = baseCoherenceTime;
        this._decoherenceRate = decoherenceRate;
        this._environmentalNoise = environmentalNoise;
        this._temperatureEffect = temperatureEffect;
    }
    /**
     * Get current base coherence time
     */
    get baseCoherenceTime() {
        return this._baseCoherenceTime;
    }
    /**
     * Get current decoherence rate
     */
    get decoherenceRate() {
        return this._decoherenceRate;
    }
    /**
     * Calculate remaining coherence time for a quantum state
     */
    calculateCoherenceTime(state, elapsedTime = 0, environmentalFactors = {}) {
        const { temperature = 1.0, magneticField = 0.0, vibration = 0.0, radiation = 0.0 } = environmentalFactors;
        // Base coherence degradation
        let coherenceTime = this._baseCoherenceTime - (elapsedTime * this._decoherenceRate);
        // Apply environmental effects
        const temperatureFactor = 1 + (temperature - 1) * this._temperatureEffect;
        const magneticFactor = 1 + magneticField * 0.05;
        const vibrationFactor = 1 + vibration * 0.1;
        const radiationFactor = 1 + radiation * 0.2;
        coherenceTime /= (temperatureFactor * magneticFactor * vibrationFactor * radiationFactor);
        // State complexity affects coherence
        const complexityFactor = this.calculateStateComplexity(state);
        coherenceTime /= (1 + complexityFactor * 0.1);
        return Math.max(0, coherenceTime);
    }
    /**
     * Apply decoherence effects to a quantum state vector
     */
    applyDecoherence(state, timeStep, environmentalFactors = {}) {
        const currentCoherence = this.calculateCoherenceTime(state, timeStep, environmentalFactors);
        const decoherenceFactor = Math.max(0, currentCoherence / this._baseCoherenceTime);
        // Apply amplitude damping
        const dampedAmplitudes = this.applyAmplitudeDamping(state.amplitudes, decoherenceFactor);
        // Apply phase damping (dephasing)
        const dephasedAmplitudes = this.applyPhaseDamping(dampedAmplitudes, decoherenceFactor);
        // Add environmental noise
        const noisyAmplitudes = this.addEnvironmentalNoise(dephasedAmplitudes, environmentalFactors);
        // Create new quantum state with decoherence effects
        const decoherentState = new QuantumStateVector_1.QuantumStateVector(noisyAmplitudes, state.phase + this.calculatePhaseNoise(decoherenceFactor), state.entanglementId);
        // Calculate decoherence metrics
        const fidelity = this.calculateFidelity(state, decoherentState);
        const entropyIncrease = this.calculateEntropyIncrease(state, decoherentState);
        return {
            decoherentState: decoherentState.normalize(),
            remainingCoherence: currentCoherence,
            decoherenceFactor,
            fidelity,
            entropyIncrease,
            isCoherent: currentCoherence > this._baseCoherenceTime * 0.1
        };
    }
    /**
     * Apply decoherence to a superposition state
     */
    applySuperpositionDecoherence(superposition, timeStep, environmentalFactors = {}) {
        // Apply decoherence to each constituent state
        const decoherentStates = [];
        const decoherenceResults = [];
        for (const state of superposition.constituentStates) {
            const result = this.applyDecoherence(state, timeStep, environmentalFactors);
            decoherentStates.push(result.decoherentState);
            decoherenceResults.push(result);
        }
        // Calculate overall superposition decoherence
        const avgCoherence = decoherenceResults.reduce((sum, r) => sum + r.remainingCoherence, 0) / decoherenceResults.length;
        const avgFidelity = decoherenceResults.reduce((sum, r) => sum + r.fidelity, 0) / decoherenceResults.length;
        // Create new superposition with decoherent states
        const decoherentSuperposition = SuperpositionState_1.SuperpositionState.fromQuantumStates(decoherentStates, [...superposition.weights], avgCoherence);
        return {
            decoherentSuperposition,
            constituentResults: decoherenceResults,
            averageCoherence: avgCoherence,
            averageFidelity: avgFidelity,
            isCoherent: avgCoherence > this._baseCoherenceTime * 0.1
        };
    }
    /**
     * Detect quantum errors in a state
     */
    detectQuantumErrors(originalState, currentState, errorThreshold = 0.01) {
        const errors = [];
        // Check amplitude errors
        const amplitudeErrors = this.detectAmplitudeErrors(originalState, currentState, errorThreshold);
        errors.push(...amplitudeErrors);
        // Check phase errors
        const phaseErrors = this.detectPhaseErrors(originalState, currentState, errorThreshold);
        errors.push(...phaseErrors);
        // Check normalization errors
        const normalizationError = this.detectNormalizationError(currentState, errorThreshold);
        if (normalizationError) {
            errors.push(normalizationError);
        }
        // Check entanglement corruption
        const entanglementError = this.detectEntanglementCorruption(originalState, currentState);
        if (entanglementError) {
            errors.push(entanglementError);
        }
        // Calculate overall error severity
        const errorSeverity = this.calculateErrorSeverity(errors);
        return {
            errors,
            errorCount: errors.length,
            errorSeverity,
            isCorrupted: errors.length > 0,
            fidelity: this.calculateFidelity(originalState, currentState)
        };
    }
    /**
     * Simulate quantum state evolution over time
     */
    simulateTimeEvolution(initialState, totalTime, timeSteps = 100, environmentalFactors = {}) {
        const timeStep = totalTime / timeSteps;
        const evolution = [initialState.clone()];
        const coherenceTimes = [this._baseCoherenceTime];
        const fidelities = [1.0];
        let currentState = initialState.clone();
        for (let step = 1; step <= timeSteps; step++) {
            const elapsedTime = step * timeStep;
            const decoherenceResult = this.applyDecoherence(currentState, elapsedTime, environmentalFactors);
            currentState = decoherenceResult.decoherentState;
            evolution.push(currentState.clone());
            coherenceTimes.push(decoherenceResult.remainingCoherence);
            fidelities.push(decoherenceResult.fidelity);
        }
        return {
            evolution,
            coherenceTimes,
            fidelities,
            finalState: currentState,
            totalDecoherence: 1 - fidelities[fidelities.length - 1],
            coherenceLifetime: this.calculateCoherenceLifetime(coherenceTimes)
        };
    }
    /**
     * Apply amplitude damping to quantum amplitudes
     */
    applyAmplitudeDamping(amplitudes, decoherenceFactor) {
        const dampingRate = Math.max(0, Math.min(1, 1 - decoherenceFactor));
        return amplitudes.map(amp => {
            // Amplitude damping reduces the magnitude while preserving phase relationships
            const magnitude = amp.magnitude();
            const dampingFactor = Math.sqrt(Math.max(0, 1 - dampingRate * (1 - Math.pow(magnitude, 2))));
            // Ensure finite result
            const scaledAmp = amp.scale(isFinite(dampingFactor) ? dampingFactor : 1);
            return scaledAmp;
        });
    }
    /**
     * Apply phase damping (dephasing) to quantum amplitudes
     */
    applyPhaseDamping(amplitudes, decoherenceFactor) {
        const dephasingRate = (1 - decoherenceFactor) * 0.5;
        return amplitudes.map(amp => {
            // Phase damping adds random phase noise
            const phaseNoise = (Math.random() - 0.5) * dephasingRate * Math.PI;
            return amp.multiply(Complex_1.Complex.fromPolar(1, phaseNoise));
        });
    }
    /**
     * Add environmental noise to quantum amplitudes
     */
    addEnvironmentalNoise(amplitudes, environmentalFactors) {
        const noiseLevel = this._environmentalNoise * (1 + (environmentalFactors.temperature || 1) * 0.1);
        return amplitudes.map(amp => {
            // Add Gaussian noise to both real and imaginary parts
            const realNoise = this.generateGaussianNoise() * noiseLevel;
            const imagNoise = this.generateGaussianNoise() * noiseLevel;
            const newReal = amp.real + realNoise;
            const newImag = amp.imaginary + imagNoise;
            // Ensure finite results
            return new Complex_1.Complex(isFinite(newReal) ? newReal : amp.real, isFinite(newImag) ? newImag : amp.imaginary);
        });
    }
    /**
     * Calculate phase noise due to decoherence
     */
    calculatePhaseNoise(decoherenceFactor) {
        const noiseAmplitude = (1 - decoherenceFactor) * Math.PI * 0.1;
        return (Math.random() - 0.5) * noiseAmplitude;
    }
    /**
     * Calculate state complexity factor
     */
    calculateStateComplexity(state) {
        const probabilities = state.getProbabilityDistribution();
        const entropy = QuantumMath_1.QuantumMath.calculateEntropy(probabilities);
        const maxEntropy = Math.log2(probabilities.length);
        return entropy / maxEntropy; // Normalized complexity [0, 1]
    }
    /**
     * Calculate fidelity between two quantum states
     */
    calculateFidelity(state1, state2) {
        const minLength = Math.min(state1.amplitudes.length, state2.amplitudes.length);
        if (minLength === 0)
            return 0;
        let innerProduct = new Complex_1.Complex(0, 0);
        for (let i = 0; i < minLength; i++) {
            const amp1 = state1.amplitudes[i];
            const amp2 = state2.amplitudes[i];
            // Check for valid amplitudes
            if (!isFinite(amp1.real) || !isFinite(amp1.imaginary) ||
                !isFinite(amp2.real) || !isFinite(amp2.imaginary)) {
                continue;
            }
            // Inner product: <ψ1|ψ2> = Σ ψ1*_i * ψ2_i
            innerProduct = innerProduct.add(amp1.conjugate().multiply(amp2));
        }
        // Fidelity is the squared magnitude of the inner product
        const magnitude = innerProduct.magnitude();
        const fidelity = Math.pow(magnitude, 2);
        // Ensure finite result
        return isFinite(fidelity) ? Math.max(0, Math.min(1, fidelity)) : 0;
    }
    /**
     * Calculate entropy increase due to decoherence
     */
    calculateEntropyIncrease(original, decoherent) {
        const originalEntropy = QuantumMath_1.QuantumMath.calculateEntropy(original.getProbabilityDistribution());
        const decoherentEntropy = QuantumMath_1.QuantumMath.calculateEntropy(decoherent.getProbabilityDistribution());
        return Math.max(0, decoherentEntropy - originalEntropy);
    }
    /**
     * Detect amplitude errors between states
     */
    detectAmplitudeErrors(original, current, threshold) {
        const errors = [];
        const minLength = Math.min(original.amplitudes.length, current.amplitudes.length);
        for (let i = 0; i < minLength; i++) {
            const originalMag = original.amplitudes[i].magnitude();
            const currentMag = current.amplitudes[i].magnitude();
            const error = Math.abs(originalMag - currentMag);
            if (error > threshold) {
                errors.push({
                    type: 'amplitude',
                    index: i,
                    severity: error,
                    description: `Amplitude error at index ${i}: ${error.toFixed(6)}`
                });
            }
        }
        return errors;
    }
    /**
     * Detect phase errors between states
     */
    detectPhaseErrors(original, current, threshold) {
        const errors = [];
        const minLength = Math.min(original.amplitudes.length, current.amplitudes.length);
        for (let i = 0; i < minLength; i++) {
            const originalPhase = original.amplitudes[i].phase();
            const currentPhase = current.amplitudes[i].phase();
            const phaseDiff = Math.abs(originalPhase - currentPhase);
            const normalizedDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff);
            if (normalizedDiff > threshold) {
                errors.push({
                    type: 'phase',
                    index: i,
                    severity: normalizedDiff,
                    description: `Phase error at index ${i}: ${normalizedDiff.toFixed(6)} radians`
                });
            }
        }
        return errors;
    }
    /**
     * Detect normalization errors
     */
    detectNormalizationError(state, threshold) {
        const totalProbability = state.getTotalProbability();
        const error = Math.abs(totalProbability - 1);
        if (error > threshold) {
            return {
                type: 'normalization',
                index: -1,
                severity: error,
                description: `Normalization error: total probability = ${totalProbability.toFixed(6)}`
            };
        }
        return null;
    }
    /**
     * Detect entanglement corruption
     */
    detectEntanglementCorruption(original, current) {
        if (original.entanglementId !== current.entanglementId) {
            return {
                type: 'entanglement',
                index: -1,
                severity: 1.0,
                description: 'Entanglement ID corruption detected'
            };
        }
        // Check correlation preservation if both states are entangled
        if (original.entanglementId && current.entanglementId) {
            const correlation = original.calculateCorrelation(current);
            if (correlation < 0.5) { // Threshold for significant correlation loss
                return {
                    type: 'entanglement',
                    index: -1,
                    severity: 1 - correlation,
                    description: `Entanglement correlation degraded: ${correlation.toFixed(6)}`
                };
            }
        }
        return null;
    }
    /**
     * Calculate overall error severity
     */
    calculateErrorSeverity(errors) {
        if (errors.length === 0)
            return 0;
        const totalSeverity = errors.reduce((sum, error) => sum + error.severity, 0);
        return totalSeverity / errors.length;
    }
    /**
     * Calculate coherence lifetime from coherence time series
     */
    calculateCoherenceLifetime(coherenceTimes) {
        // Find the time when coherence drops to 1/e of initial value
        const initialCoherence = coherenceTimes[0];
        const threshold = initialCoherence / Math.E;
        for (let i = 1; i < coherenceTimes.length; i++) {
            if (coherenceTimes[i] <= threshold) {
                return i - 1; // Return time step when coherence lifetime is reached
            }
        }
        return coherenceTimes.length - 1; // Coherence maintained throughout simulation
    }
    /**
     * Generate Gaussian noise using Box-Muller transform
     */
    generateGaussianNoise() {
        const u1 = Math.max(1e-10, Math.random()); // Avoid log(0)
        const u2 = Math.random();
        const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        // Ensure finite result
        return isFinite(noise) ? noise : 0;
    }
}
exports.QuantumDecoherenceSimulator = QuantumDecoherenceSimulator;
//# sourceMappingURL=QuantumDecoherenceSimulator.js.map