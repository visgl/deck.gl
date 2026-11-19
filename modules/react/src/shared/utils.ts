import {globalScope} from './constants';

/**
 * No-operation function that does nothing when called
 *
 * Useful as a default callback or placeholder to avoid null checks.
 *
 * @example
 * ```typescript
 * const onClick = enabled ? handleClick : noop;
 * onClick(); // Safe to call even when disabled
 * ```
 */
export function noop(): void {
  // void
}

/**
 * Type guard to check if a value is defined (not undefined)
 *
 * Does NOT check for null - use strict equality if null checking is needed.
 *
 * @template T - The type of the value being checked
 * @param value - Value to check for definition
 * @returns True if value is not undefined, false otherwise
 *
 * @example
 * ```typescript
 * const config = getConfig();
 * if (isDefined(config)) {
 *   // TypeScript now knows config is not undefined
 *   // (could still be null)
 *   applyConfig(config);
 * }
 * ```
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type guard to check if a value is a function
 *
 * @param a - Value to check
 * @returns True if value is a function, false otherwise
 *
 * @example
 * ```typescript
 * const handler = props.onClick;
 * if (isFn(handler)) {
 *   handler(event);
 * }
 * ```
 */
export function isFn(a: unknown): a is (...args: unknown[]) => unknown {
  return typeof a === 'function';
}

/**
 * Converts the first character of a string to uppercase (PascalCase)
 *
 * Leaves the rest of the string unchanged. Returns empty string for empty input.
 *
 * @param str - String to convert
 * @returns String with first character uppercased, or empty string if input is empty
 *
 * @example
 * ```typescript
 * toPascal('myLayer'); // 'MyLayer'
 * toPascal('myComponent');      // 'MyComponent'
 * toPascal('');                 // ''
 * ```
 */
export function toPascal(str: string): string {
  if (str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Flag indicating whether code is running in a browser environment
 *
 * Checks for the presence of `document` on the global scope. False in
 * Node.js, Web Workers, and other non-browser JavaScript environments.
 *
 * @example
 * ```typescript
 * if (isBrowserEnvironment) {
 *   // Safe to use document, window.location, etc.
 *   document.getElementById('root');
 * } else {
 *   // Running in Node.js or Web Worker
 * }
 * ```
 */
export const isBrowserEnvironment: boolean = Boolean(
  globalScope && isDefined((globalScope as Window & typeof globalThis).document)
);
