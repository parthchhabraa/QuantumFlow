/**
 * Complex number implementation for quantum state calculations
 */
export declare class Complex {
    readonly real: number;
    readonly imaginary: number;
    constructor(real: number, imaginary?: number);
    /**
     * Create a complex number from real part only
     */
    static fromReal(real: number): Complex;
    /**
     * Create a complex number from imaginary part only
     */
    static fromImaginary(imaginary: number): Complex;
    /**
     * Create complex number from polar coordinates
     */
    static fromPolar(magnitude: number, phase: number): Complex;
    /**
     * Add two complex numbers
     */
    add(other: Complex): Complex;
    /**
     * Subtract two complex numbers
     */
    subtract(other: Complex): Complex;
    /**
     * Multiply two complex numbers
     */
    multiply(other: Complex): Complex;
    /**
     * Multiply by a scalar
     */
    scale(scalar: number): Complex;
    /**
     * Complex conjugate
     */
    conjugate(): Complex;
    /**
     * Magnitude (absolute value) of complex number
     */
    magnitude(): number;
    /**
     * Phase (argument) of complex number
     */
    phase(): number;
    /**
     * Magnitude squared (for probability calculations)
     */
    magnitudeSquared(): number;
    /**
     * Normalize the complex number to unit magnitude
     */
    normalize(): Complex;
    /**
     * Check if two complex numbers are approximately equal
     */
    equals(other: Complex, tolerance?: number): boolean;
    /**
     * String representation
     */
    toString(): string;
}
//# sourceMappingURL=Complex.d.ts.map