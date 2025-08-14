/**
 * Complex number implementation for quantum state calculations
 */
export class Complex {
  constructor(
    public readonly real: number,
    public readonly imaginary: number = 0
  ) {}

  /**
   * Create a complex number from real part only
   */
  static fromReal(real: number): Complex {
    return new Complex(real, 0);
  }

  /**
   * Create a complex number from imaginary part only
   */
  static fromImaginary(imaginary: number): Complex {
    return new Complex(0, imaginary);
  }

  /**
   * Create complex number from polar coordinates
   */
  static fromPolar(magnitude: number, phase: number): Complex {
    return new Complex(
      magnitude * Math.cos(phase),
      magnitude * Math.sin(phase)
    );
  }

  /**
   * Add two complex numbers
   */
  add(other: Complex): Complex {
    return new Complex(
      this.real + other.real,
      this.imaginary + other.imaginary
    );
  }

  /**
   * Subtract two complex numbers
   */
  subtract(other: Complex): Complex {
    return new Complex(
      this.real - other.real,
      this.imaginary - other.imaginary
    );
  }

  /**
   * Multiply two complex numbers
   */
  multiply(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imaginary * other.imaginary,
      this.real * other.imaginary + this.imaginary * other.real
    );
  }

  /**
   * Multiply by a scalar
   */
  scale(scalar: number): Complex {
    return new Complex(this.real * scalar, this.imaginary * scalar);
  }

  /**
   * Complex conjugate
   */
  conjugate(): Complex {
    return new Complex(this.real, -this.imaginary);
  }

  /**
   * Magnitude (absolute value) of complex number
   */
  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
  }

  /**
   * Phase (argument) of complex number
   */
  phase(): number {
    return Math.atan2(this.imaginary, this.real);
  }

  /**
   * Magnitude squared (for probability calculations)
   */
  magnitudeSquared(): number {
    return this.real * this.real + this.imaginary * this.imaginary;
  }

  /**
   * Normalize the complex number to unit magnitude
   */
  normalize(): Complex {
    const mag = this.magnitude();
    if (mag === 0) return new Complex(0, 0);
    return new Complex(this.real / mag, this.imaginary / mag);
  }

  /**
   * Check if two complex numbers are approximately equal
   */
  equals(other: Complex, tolerance: number = 1e-10): boolean {
    return Math.abs(this.real - other.real) < tolerance &&
           Math.abs(this.imaginary - other.imaginary) < tolerance;
  }

  /**
   * String representation
   */
  toString(): string {
    if (this.imaginary === 0) return this.real.toString();
    if (this.real === 0) return `${this.imaginary}i`;
    const sign = this.imaginary >= 0 ? '+' : '-';
    return `${this.real}${sign}${Math.abs(this.imaginary)}i`;
  }
}