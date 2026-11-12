// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {sqlParser} from '@deck.gl/core/sql';

import {tableFromArrays} from 'apache-arrow';
import {projectColumns} from '../../../../modules/core/src/arrow/columns-query';

const {parseExpression: parseSQLExpression, parsePredicate: parseSQLPredicate} = sqlParser;

test('columnsQuery projects bare and loader-wrapped tables without copying values', () => {
  const data = tableFromArrays({size: [2, 4], label: ['a', 'b'], omitted: [1, 2]});
  const query = {select: [{as: 'radii', column: 'size'}, 'label']};
  for (const source of [data, {shape: 'arrow-table', data}]) {
    const {table: result} = projectColumns(source, query);
    expect(result.schema.fields.map(field => field.name)).toEqual(['radii', 'label']);
    expect(result.getChild('radii')?.data[0].values).toBe(data.getChild('size')?.data[0].values);
    expect(result.get(1)?.label).toBe('b');
  }
  expect(() => projectColumns(data, {select: ['missing']})).toThrow(/missing/);
  expect(() => projectColumns([], query)).toThrow('requires Arrow table');
});

test('columnsQuery filters rows before computing positions and packed colors', () => {
  const data = tableFromArrays({x: [null, 2, 3], y: [1, 4, 5], label: ['a', 'b', 'c']});
  const {table: result, sourceRowIndices} = projectColumns(
    {shape: 'arrow-table', data},
    {
      where: parseSQLPredicate('x IS NOT NULL'),
      limit: 1,
      select: [
        {as: 'positions', expression: parseSQLExpression('ARRAY[x, y]::DOUBLE PRECISION[2]')},
        {as: 'name', column: 'label'},
        {as: 'fillColors', expression: parseSQLExpression('PACK_UNORM8(ARRAY[0.0, 0.5, 1.0, 1.0])')}
      ]
    }
  );
  expect(result.schema.fields.map(field => field.name)).toEqual([
    'positions',
    'name',
    'fillColors'
  ]);
  expect(result.numRows).toBe(1);
  expect(result.get(0)?.name).toBe('b');
  expect(sourceRowIndices?.get(0)).toBe(1);
  expect(Array.from(result.getChild('positions')!.get(0))).toEqual([2, 4]);
  expect(Array.from(result.getChild('fillColors')!.get(0))).toEqual([0, 128, 255, 255]);
});

test('columnsQuery requires an injected parser for query and expression strings', () => {
  const data = tableFromArrays({x: [1, 2], y: [3, 4]});
  const sql = 'SELECT ARRAY[x, y]::DOUBLE PRECISION[2] AS positions WHERE x > 1';
  expect(() => projectColumns(data, sql)).toThrow('sqlParser.parseQuery');
  const {table: result} = projectColumns(data, sql, sqlParser);
  expect(result.numRows).toBe(1);
  expect(Array.from(result.getChild('positions')!.get(0))).toEqual([2, 4]);

  const query = {select: [{as: 'radii', expression: 'x + 1'}], where: 'x > 1'};
  expect(() => projectColumns(data, query)).toThrow('sqlParser.parsePredicate');
  expect(() => projectColumns(data, query, {parsePredicate: parseSQLPredicate})).toThrow(
    'sqlParser.parseExpression'
  );
  expect(
    projectColumns(data, query, {
      parsePredicate: parseSQLPredicate,
      parseExpression: parseSQLExpression
    })
      .table.getChild('radii')
      ?.get(0)
  ).toBe(3);
});

test('per-column SQL expressions preserve rows and evaluate typed constructors', () => {
  const source = tableFromArrays({
    longitude: [-122.4, -73.9, 4],
    latitude: [37.7, 40.7, 12],
    size: [1, 4, 9],
    red: [1.5, 0.5, -1],
    green: [0.5, 0, 1],
    blue: [0, 1, 0.5]
  });
  const {table} = projectColumns(source, {
    positions: 'FLOAT32x2(longitude, latitude)',
    radii: 'SQRT(size) * 2',
    fillColors: 'RGBA8(red, green, blue, 1)',
    lineColors: 'RGBA16(red, green, blue, 1)'
  }, sqlParser);
  expect(table.numRows).toBe(source.numRows);
  expect(table.schema.fields.map(field => field.name)).toEqual([
    'positions', 'radii', 'fillColors', 'lineColors'
  ]);
  expect(Array.from(table.getChild('positions')!.get(0))).toEqual([
    Math.fround(-122.4), Math.fround(37.7)
  ]);
  expect(table.getChild('radii')!.toArray()).toEqual(Float64Array.from([2, 4, 6]));
  expect(Array.from(table.getChild('fillColors')!.get(0))).toEqual([255, 128, 0, 255]);
  expect(Array.from(table.getChild('fillColors')!.get(2))).toEqual([0, 255, 128, 255]);
  expect(Array.from(table.getChild('lineColors')!.get(1))).toEqual([32768, 0, 65535, 65535]);
});

test('per-column expressions reject row-changing SQL and wrong constructor arity', () => {
  const source = tableFromArrays({x: [1, 2], y: [3, 4]});
  expect(() => projectColumns(source, {positions: 'SELECT x WHERE x > 1'}, sqlParser))
    .toThrow();
  expect(() => projectColumns(source, {positions: 'FLOAT32x2(x)'}, sqlParser))
    .toThrow(/requires exactly 2 arguments/);
  expect(() => projectColumns(source, {positions: 'FLOAT32x2(x, y)'}, undefined))
    .toThrow(/sqlParser.parseExpression/);
});

test('null input makes the entire typed column value null', () => {
  const source = tableFromArrays({x: [1, null], y: [2, 3]});
  const {table} = projectColumns(source, {positions: 'FLOAT32x2(x, y)'}, sqlParser);
  expect(Array.from(table.getChild('positions')!.get(0))).toEqual([1, 2]);
  expect(table.getChild('positions')!.get(1)).toBeNull();
});
