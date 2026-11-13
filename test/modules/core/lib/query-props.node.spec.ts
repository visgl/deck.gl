// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {tableFromArrays} from 'apache-arrow';
import type {QueryProps} from '../../../../modules/core/src/types/layer-props';
import {evaluateQueryProps} from '../../../../modules/core/src/arrow/query-props';
import {evaluateQueryAccessorProps} from '../../../../modules/core/src/arrow/query-accessor-props';

test('_queryProps evaluates aggregate-derived numeric layer values', async () => {
  const table = tableFromArrays({population: [4, 9, 16]});
  const values = await evaluateQueryProps(table, {
    radiusScale: '100 / MAX(population)',
    opacity: 'AVG(population) / SUM(population)',
    elevationScale: 'MIN(population) * 2'
  });
  expect(values.radiusScale).toBe(6.25);
  expect(values.opacity).toBeCloseTo(1 / 3);
  expect(values.elevationScale).toBe(8);
});

test('_queryProps rejects row-level expressions and nonfinite results', async () => {
  const table = tableFromArrays({population: [0, 2]});
  await expect(evaluateQueryProps(table, {radiusScale: 'population'}))
    .rejects.toThrow('inside aggregates');
  await expect(evaluateQueryProps(table, {radiusScale: '1 / MIN(population)'}))
    .rejects.toThrow('finite number');
});

test('QueryProps maps only numeric properties to optional SQL strings', () => {
  type Props = {radiusScale?: number; opacity?: number; pickable?: boolean; name?: string};
  const valid: QueryProps<Props> = {radiusScale: 'MAX(radius)', opacity: 'AVG(opacity)'};
  expect(valid.radiusScale).toBe('MAX(radius)');
  // @ts-expect-error Boolean props are not queryable in the initial numeric-only API.
  const invalid: QueryProps<Props> = {pickable: 'COUNT(*)'};
  expect(invalid).toBeDefined();
});

test('_queryProps evaluates accessor expressions row by row', async () => {
  const table = tableFromArrays({
    x: [1, 2], y: [3, 4],
    size: [9, 16], red: [1, 0.5], green: [0, 0.5], blue: [0, 0.5]
  });
  const accessors = await evaluateQueryAccessorProps(table, {
    getPosition: 'FLOAT32x2(x, y)',
    getRadius: 'SQRT(size)',
    getFillColor: 'RGBA8(red, green, blue, 1)'
  });
  expect(accessors.getPosition(null, {index: 0})).toEqual([1, 3]);
  expect(accessors.getPosition(null, {index: 1})).toEqual([2, 4]);
  expect(accessors.getRadius(null, {index: 1})).toBe(4);
  expect(accessors.getFillColor(null, {index: 0})).toEqual([255, 0, 0, 255]);
  expect(accessors.getFillColor(null, {index: 1})).toEqual([128, 128, 128, 255]);
});

test('_queryProps accessor expressions reject statements and incorrect vector arity', async () => {
  const table = tableFromArrays({x: [1], y: [2]});
  await expect(evaluateQueryAccessorProps(table, {getPosition: 'SELECT x WHERE x > 0'}))
    .rejects.toThrow();
  await expect(evaluateQueryAccessorProps(table, {getPosition: 'FLOAT32x2(x)'}))
    .rejects.toThrow('requires exactly 2 arguments');
});

test('QueryProps includes function-valued get* accessors but not unrelated props', () => {
  type Props = {
    radiusScale?: number;
    getPosition?: (object: unknown, context: {index: number}) => [number, number];
    getFillColor?: [number, number, number, number] | ((object: unknown) => number[]);
    pickable?: boolean;
  };
  const valid: QueryProps<Props> = {
    radiusScale: 'MAX(value)',
    getPosition: 'FLOAT32x2(x, y)',
    getFillColor: 'RGBA8(r, g, b, 1)'
  };
  expect(valid.getPosition).toBe('FLOAT32x2(x, y)');
  // @ts-expect-error Boolean props cannot use query expressions.
  const bad: QueryProps<Props> = {pickable: 'COUNT(*)'};
  expect(bad).toBeDefined();
});
