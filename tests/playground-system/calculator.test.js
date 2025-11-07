import { describe, it } from 'node:test';
import assert from 'node:assert';
import { add, subtract, multiply, divide } from './calculator.js';

describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    assert.strictEqual(add(2, 3), 5);
    assert.strictEqual(add(-1, 1), 0);
  });

  it('should subtract two numbers correctly', () => {
    assert.strictEqual(subtract(5, 3), 2);
    assert.strictEqual(subtract(0, 5), -5);
  });

  it('should multiply two numbers correctly', () => {
    assert.strictEqual(multiply(3, 4), 12);
    assert.strictEqual(multiply(-2, 5), -10);
    assert.strictEqual(multiply(0, 10), 0);
  });

  it('should divide two numbers correctly', () => {
    assert.strictEqual(divide(10, 2), 5);
    assert.strictEqual(divide(9, 3), 3);
  });

  it('should throw error when dividing by zero', () => {
    assert.throws(() => divide(10, 0), {
      name: 'Error',
      message: 'Cannot divide by zero'
    });
  });
});
