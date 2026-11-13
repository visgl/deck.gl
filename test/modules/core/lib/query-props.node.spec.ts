// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {tableFromArrays} from 'apache-arrow';
import type {QueryProps} from '../../../../modules/core/src/types/layer-props';
import {evaluateQueryProps} from '../../../../modules/core/src/arrow/query-props';

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
