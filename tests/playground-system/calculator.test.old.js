import { describe, it } from 'node:test';
import assert from 'node:assert';
import { add, subtract, divide } from './calculator.js';

describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    assert.strictEqual(add(2, 3), 5);
    assert.strictEqual(add(-1, 1), 0);
  });

  it('should subtract two numbers correctly', () => {
    assert.strictEqual(subtract(5, 3), 2);
    assert.strictEqual(subtract(0, 5), -5);
  });

  it('should divide two numbers correctly', () => {
    assert.strictEqual(divide(10, 2), 5);
    assert.strictEqual(divide(9, 3), 3);
  });
});
