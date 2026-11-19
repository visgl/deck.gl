// @vitest-environment node

import * as fc from 'fast-check';
import {describe, expect, expectTypeOf, it} from 'vitest';

import {isDefined, isFn, isBrowserEnvironment, noop, toPascal} from '../utils';

describe('Utility Functions Tests', () => {
  describe('isDefined()', () => {
    it.each([
      {description: 'undefined', expected: false, value: undefined},
      {description: 'null', expected: true, value: null},
      {description: '0', expected: true, value: 0},
      {description: 'empty string', expected: true, value: ''},
      {description: 'false', expected: true, value: false}
    ])('should return $expected for $description', ({value, expected}) => {
      expect(isDefined(value)).toBe(expected);
    });
  });

  describe('isFn()', () => {
    it.each([
      {description: 'arrow function', value: () => {}},
      {
        description: 'function expression',
        // oxlint-disable-next-line unicorn/consistent-function-scoping
        value: function value() {}
      },
      {
        description: 'named function',
        // oxlint-disable-next-line unicorn/consistent-function-scoping
        value: function named() {}
      },
      {description: 'built-in function', value: Math.max}
    ])('should return true for $description', ({value}) => {
      expect(isFn(value)).toBeTruthy();
    });

    it.each([
      {description: 'number', value: 123},
      {description: 'string', value: 'string'},
      {description: 'object', value: {}},
      {description: 'array', value: []},
      {description: 'null', value: null},
      {description: 'undefined', value: undefined}
    ])('should return false for $description', ({value}) => {
      expect(isFn(value)).toBeFalsy();
    });
  });

  describe('toPascal()', () => {
    // Property-based tests
    it('property: idempotent for non-empty strings', () => {
      fc.assert(
        fc.property(fc.string({maxLength: 100, minLength: 1}), str => {
          expect(toPascal(toPascal(str))).toBe(toPascal(str));
        })
      );
    });

    it('property: first character always uppercase for non-empty strings', () => {
      fc.assert(
        fc.property(fc.string({maxLength: 100, minLength: 1}), str => {
          const result = toPascal(str);

          expect(result[0]).toBe(result[0].toUpperCase());
        })
      );
    });

    it('property: preserves length', () => {
      fc.assert(
        fc.property(fc.string({maxLength: 100}), str => {
          expect(toPascal(str)).toHaveLength(str.length);
        })
      );
    });

    // Example-based tests for specific cases
    it.each([
      {description: 'lowercase word', expected: 'Hello', input: 'hello'},
      {
        description: 'camelCase',
        expected: 'HelloWorld',
        input: 'helloWorld'
      },
      {description: 'empty string', expected: '', input: ''},
      {
        description: 'already capitalized',
        expected: 'Already',
        input: 'Already'
      },
      {description: 'single character', expected: 'A', input: 'a'},
      {
        description: 'starts with number',
        expected: '123abc',
        input: '123abc'
      },
      {description: 'Unicode character', expected: 'Über', input: 'über'},
      {
        description: 'starts with whitespace',
        expected: ' hello',
        input: ' hello'
      },
      {description: 'special characters', expected: '_test', input: '_test'}
    ])('should return "$expected" for $description', ({input, expected}) => {
      expect(toPascal(input)).toBe(expected);
    });
  });

  describe('noop()', () => {
    it('should return undefined when called', () => {
      const result = noop();

      expect(result).toBeUndefined();
    });

    it('should be callable without throwing errors', () => {
      expect(() => noop()).not.toThrow();
    });

    it('should be usable as a default callback', () => {
      const callback = noop;

      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      expect(callback()).toBeUndefined();
    });
  });

  describe('isBrowserEnvironment()', () => {
    it('should be a boolean value', () => {
      expectTypeOf(isBrowserEnvironment).toBeBoolean();
    });

    it('should be false in Node.js test environment', () => {
      // vitest.config.ts uses environment: 'node', so no document exists
      expect(isBrowserEnvironment).toBeFalsy();
    });
  });
});
