"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Complex = void 0;
/**
 * Complex number implementation for quantum state calculations
 */
class Complex {
    constructor(real, imaginary = 0) {
        this.real = real;
        this.imaginary = imaginary;
    }
    /**
     * Create a complex number from real part only
     */
    static fromReal(real) {
        return new Complex(real, 0);
    }
    /**
     * Create a complex number from imaginary part only
     */
    static fromImaginary(imaginary) {
        return new Complex(0, imaginary);
    }
    /**
     * Create complex number from polar coordinates
     */
    static fromPolar(magnitude, phase) {
        return new Complex(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
    }
    /**
     * Add two complex numbers
     */
    add(other) {
        return new Complex(this.real + other.real, this.imaginary + other.imaginary);
    }
    /**
     * Subtract two complex numbers
     */
    subtract(other) {
        return new Complex(this.real - other.real, this.imaginary - other.imaginary);
    }
    /**
     * Multiply two complex numbers
     */
    multiply(other) {
        return new Complex(this.real * other.real - this.imaginary * other.imaginary, this.real * other.imaginary + this.imaginary * other.real);
    }
    /**
     * Multiply by a scalar
     */
    scale(scalar) {
        return new Complex(this.real * scalar, this.imaginary * scalar);
    }
    /**
     * Complex conjugate
     */
    conjugate() {
        return new Complex(this.real, -this.imaginary);
    }
    /**
     * Magnitude (absolute value) of complex number
     */
    magnitude() {
        return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
    }
    /**
     * Phase (argument) of complex number
     */
    phase() {
        return Math.atan2(this.imaginary, this.real);
    }
    /**
     * Magnitude squared (for probability calculations)
     */
    magnitudeSquared() {
        return this.real * this.real + this.imaginary * this.imaginary;
    }
    /**
     * Normalize the complex number to unit magnitude
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0)
            return new Complex(0, 0);
        return new Complex(this.real / mag, this.imaginary / mag);
    }
    /**
     * Check if two complex numbers are approximately equal
     */
    equals(other, tolerance = 1e-10) {
        return Math.abs(this.real - other.real) < tolerance &&
            Math.abs(this.imaginary - other.imaginary) < tolerance;
    }
    /**
     * String representation
     */
    toString() {
        if (this.imaginary === 0)
            return this.real.toString();
        if (this.real === 0)
            return `${this.imaginary}i`;
        const sign = this.imaginary >= 0 ? '+' : '-';
        return `${this.real}${sign}${Math.abs(this.imaginary)}i`;
    }
}
exports.Complex = Complex;
//# sourceMappingURL=Complex.js.map