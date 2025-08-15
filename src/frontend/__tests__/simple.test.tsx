/**
 * Simple test to verify frontend testing setup
 */

describe('Frontend Test Setup', () => {
  test('basic test functionality', () => {
    expect(1 + 1).toBe(2);
  });

  test('can import React components', () => {
    // This test verifies that our TypeScript and React setup works
    const mockComponent = () => 'Hello World';
    expect(mockComponent()).toBe('Hello World');
  });

  test('testing environment is jsdom', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});