// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export function toLowPrecision(input: number, precision?: number): number;
export function toLowPrecision(input: number[], precision?: number): number[];
export function toLowPrecision(
  input: Record<string, number>,
  precision?: number
): Record<string, number>;

/**
 * Covert all numbers in a deep structure to a given precision, allowing
 * reliable float comparisons. Converts data in-place.
 */
export function toLowPrecision(
  input: number | number[] | Record<string, number>,
  precision: number = 11
): number | number[] | Record<string, number> {
  /* eslint-disable guard-for-in */
  if (typeof input === 'number') {
    return Number(input.toPrecision(precision));
  }
  if (Array.isArray(input)) {
    return input.map(item => toLowPrecision(item, precision));
  }
  if (typeof input === 'object') {
    for (const key in input) {
      input[key] = toLowPrecision(input[key], precision);
    }
  }
  return input;
}
