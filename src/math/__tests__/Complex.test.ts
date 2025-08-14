import { Complex } from '../Complex';

describe('Complex', () => {
  describe('constructor and factory methods', () => {
    test('should create complex number with real and imaginary parts', () => {
      const c = new Complex(3, 4);
      expect(c.real).toBe(3);
      expect(c.imaginary).toBe(4);
    });

    test('should create from real part only', () => {
      const c = Complex.fromReal(5);
      expect(c.real).toBe(5);
      expect(c.imaginary).toBe(0);
    });

    test('should create from imaginary part only', () => {
      const c = Complex.fromImaginary(3);
      expect(c.real).toBe(0);
      expect(c.imaginary).toBe(3);
    });

    test('should create from polar coordinates', () => {
      const c = Complex.fromPolar(1, Math.PI / 2);
      expect(c.real).toBeCloseTo(0, 10);
      expect(c.imaginary).toBeCloseTo(1, 10);
    });
  });

  describe('arithmetic operations', () => {
    test('should add complex numbers', () => {
      const c1 = new Complex(1, 2);
      const c2 = new Complex(3, 4);
      const result = c1.add(c2);
      expect(result.real).toBe(4);
      expect(result.imaginary).toBe(6);
    });

    test('should subtract complex numbers', () => {
      const c1 = new Complex(5, 7);
      const c2 = new Complex(2, 3);
      const result = c1.subtract(c2);
      expect(result.real).toBe(3);
      expect(result.imaginary).toBe(4);
    });

    test('should multiply complex numbers', () => {
      const c1 = new Complex(1, 2);
      const c2 = new Complex(3, 4);
      const result = c1.multiply(c2);
      expect(result.real).toBe(-5); // 1*3 - 2*4
      expect(result.imaginary).toBe(10); // 1*4 + 2*3
    });

    test('should scale by scalar', () => {
      const c = new Complex(2, 3);
      const result = c.scale(2);
      expect(result.real).toBe(4);
      expect(result.imaginary).toBe(6);
    });
  });

  describe('properties and operations', () => {
    test('should calculate magnitude', () => {
      const c = new Complex(3, 4);
      expect(c.magnitude()).toBe(5);
    });

    test('should calculate phase', () => {
      const c = new Complex(1, 1);
      expect(c.phase()).toBeCloseTo(Math.PI / 4, 10);
    });

    test('should calculate magnitude squared', () => {
      const c = new Complex(3, 4);
      expect(c.magnitudeSquared()).toBe(25);
    });

    test('should calculate conjugate', () => {
      const c = new Complex(3, 4);
      const conj = c.conjugate();
      expect(conj.real).toBe(3);
      expect(conj.imaginary).toBe(-4);
    });

    test('should normalize complex number', () => {
      const c = new Complex(3, 4);
      const normalized = c.normalize();
      expect(normalized.magnitude()).toBeCloseTo(1, 10);
    });

    test('should check equality with tolerance', () => {
      const c1 = new Complex(1.0000001, 2.0000001);
      const c2 = new Complex(1, 2);
      expect(c1.equals(c2, 1e-6)).toBe(true);
      expect(c1.equals(c2, 1e-8)).toBe(false);
    });
  });
});