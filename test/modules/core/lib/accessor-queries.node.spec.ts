// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {
  Field,
  Float64,
  List,
  Struct,
  Table,
  Utf8,
  tableFromArrays,
  vectorFromArray,
  type Vector
} from 'apache-arrow';
import {sqlParser} from '@deck.gl/core/sql';
import {LayerManager, Viewport} from '@deck.gl/core';
import {NullDevice} from '@luma.gl/core/test-utils';
import type {ArrowAccessor, Position} from '@deck.gl/core';
import Layer from '../../../../modules/core/src/lib/layer';
import LayerState from '../../../../modules/core/src/lib/layer-state';
import {evaluateAccessorQueries} from '../../../../modules/core/src/arrow/accessor-queries';

class QueryLayer extends Layer<{getPosition?: ArrowAccessor<unknown, Position>}> {
  static layerName = 'QueryLayer';
  static defaultProps = {getPosition: {type: 'accessor', arrow: true, value: [0, 0]}};
  initializeState() {}
}

test('SQL accessors resolve through core, keep source rows, and survive cloning', async () => {
  const data = tableFromArrays({x: [1, 2], y: [3, 4], label: ['a', 'b']});
  const parseExpression = vi.fn(sqlParser.parseExpression);
  const context = {sqlParser: {parseExpression}, layerManager: {setNeedsUpdate() {}}};
  const first = new QueryLayer({data, getPosition: {sql: 'FLOAT64x2(x, y)'}});
  const state = new LayerState({attributeManager: null, layer: first});
  const update = (layer: QueryLayer) => {
    Object.assign(layer, {context, internalState: state});
    state.setAsyncProps(layer.props);
    layer['_clearChangeFlags']();
    layer['updateAccessorQueries']();
  };

  update(first);
  expect(state.accessorQueries?.pending).toBe(true);
  await vi.waitFor(() => expect(state.accessorQueries?.pending).toBe(false));
  const positions = first.props.getPosition as Vector;
  expect(Array.from(positions.get(1))).toEqual([2, 4]);
  expect(first.props.data).toBe(data);

  const cloned = first.clone({});
  update(cloned);
  expect(cloned.props.getPosition).toBe(positions);
  expect(parseExpression).toHaveBeenCalledTimes(1);

  const changed = cloned.clone({getPosition: {sql: 'FLOAT64x2(y, x)'}});
  update(changed);
  await vi.waitFor(() => expect(state.accessorQueries?.pending).toBe(false));
  expect(Array.from((changed.props.getPosition as Vector).get(1))).toEqual([4, 2]);

  const constant = changed.clone({getPosition: [10, 20]});
  update(constant);
  expect(constant.props.getPosition).toEqual([10, 20]);
  expect(state.accessorQueries).toBeUndefined();
});

test('SQL accessors evaluate new batches in source order and reuse existing buffers', () => {
  const first = tableFromArrays({x: [1, null], y: [3, 4]});
  const second = tableFromArrays({x: [2], y: [5]});
  const data = new Table([...first.batches, ...second.batches]);
  const expressions = {getPosition: 'FLOAT32x2(x, y)', getRadius: 'FLOAT32(y * 2)'};
  const parseExpression = sqlParser.parseExpression;
  const table = evaluateAccessorQueries(first, expressions, parseExpression);
  const result = evaluateAccessorQueries(data, expressions, parseExpression, {
    source: first,
    expressions,
    parseExpression,
    table
  });
  expect(result.batches[0]).toBe(table.batches[0]);
  expect(Array.from(result.getChild('getPosition')!.get(2))).toEqual([2, 5]);
  expect(result.getChild('getPosition')!.get(1)).toBeNull();
  expect(Array.from(result.getChild('getRadius')!)).toEqual([6, 8, 10]);
  const defaultTable = evaluateAccessorQueries(first, expressions, undefined);
  const appended = evaluateAccessorQueries(data, expressions, undefined, {
    source: first,
    expressions,
    parseExpression: undefined,
    table: defaultTable
  });
  expect(appended.batches[0]).toBe(defaultTable.batches[0]);
  expect(Array.from(appended.getChild('getRadius')!)).toEqual([6, 8, 10]);
});

test('SQL accessors select Arrow lists without copying or changing their type', () => {
  const cells = vectorFromArray([['8928308280fffff']], new List(new Field('cell', new Utf8())));
  const data = new Table({cells});
  const projected = evaluateAccessorQueries(
    data,
    {getHexagons: 'cells'},
    sqlParser.parseExpression
  );
  expect(projected.getChild('getHexagons')!.data[0]).toBe(cells.data[0]);
  expect(() =>
    evaluateAccessorQueries(data, {getHexagons: 'missing'}, sqlParser.parseExpression)
  ).toThrow('Unknown Arrow column: missing');
});

test('SQL accessor constructors preserve every source batch boundary', () => {
  const first = tableFromArrays({x: [1, 2], y: [3, 4]});
  const second = tableFromArrays({x: [3], y: [5]});
  const data = new Table([...first.batches, ...second.batches]);
  const result = evaluateAccessorQueries(
    data,
    {getPosition: 'FLOAT64x2(x, y)'},
    sqlParser.parseExpression
  );
  expect(result.getChild('getPosition')!.data.map(chunk => chunk.length)).toEqual(
    data.getChild('x')!.data.map(chunk => chunk.length)
  );
});

test('layer updates wait for SQL accessor values on replacement data', async () => {
  const device = new NullDevice({});
  const manager = new LayerManager(device, {viewport: new Viewport()});
  const first = new QueryLayer({
    data: tableFromArrays({x: [1], y: [2]}),
    getPosition: {sql: 'FLOAT32x2(x, y)'}
  });
  const initialUpdate = vi.spyOn(first, 'updateState');
  const draw = vi.spyOn(first, 'draw');
  const renderPass = device.beginRenderPass({});

  try {
    manager.setLayers([first]);
    expect(initialUpdate).not.toHaveBeenCalled();
    first._drawLayer({renderPass, shaderModuleProps: null, uniforms: {}, parameters: {}});
    expect(draw).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(first.isLoaded).toBe(true));
    manager.updateLayers();
    expect(initialUpdate).toHaveBeenCalledOnce();
    first._drawLayer({renderPass, shaderModuleProps: null, uniforms: {}, parameters: {}});
    expect(draw).toHaveBeenCalledOnce();

    const next = first.clone({data: tableFromArrays({x: [3], y: [4]})});
    const replacementUpdate = vi.spyOn(next, 'updateState');
    manager.setLayers([next]);
    expect(replacementUpdate).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(next.isLoaded).toBe(true));
    manager.updateLayers();
    expect(replacementUpdate).toHaveBeenCalledOnce();
    expect(Array.from((next.props.getPosition as Vector).get(0))).toEqual([3, 4]);
  } finally {
    renderPass.end();
    manager.finalize();
    device.destroy();
  }
});

test('a failed replacement load leaves the layer free to update its previous Arrow data', async () => {
  const device = new NullDevice({});
  const manager = new LayerManager(device, {viewport: new Viewport()});
  const data = tableFromArrays({x: [1], y: [2]});
  const first = new QueryLayer({data, getPosition: {sql: 'FLOAT32x2(x, y)'}});
  const onError = vi.fn();
  try {
    manager.setProps({sqlParser});
    manager.setLayers([first]);
    await vi.waitFor(() => expect(first.isLoaded).toBe(true));
    manager.updateLayers();

    const failed = first.clone({data: Promise.reject(new Error('Failed to load')), onError});
    manager.setLayers([failed]);
    await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce());

    const next = failed.clone({opacity: 0.5});
    const update = vi.spyOn(next, 'updateState');
    manager.setLayers([next]);
    expect(update).toHaveBeenCalledOnce();
    expect(next.props.data).toBe(data);
    expect(next.props.getPosition).toBe(first.props.getPosition);
  } finally {
    manager.finalize();
    device.destroy();
  }
});

test('typed SQL colors clamp channels and propagate nulls', () => {
  const data = tableFromArrays({red: [-1, null], green: [0.5, 0], blue: [2, 1]});
  const result = evaluateAccessorQueries(
    data,
    {getFillColor: 'RGBA8(red, green, blue, 1)'},
    sqlParser.parseExpression
  );
  const colors = result.getChild('getFillColor')!;
  expect(Array.from(colors.get(0))).toEqual([0, 128, 255, 255]);
  expect(colors.get(1)).toBeNull();
  expect(() =>
    evaluateAccessorQueries(
      data,
      {getFillColor: 'RGBA8(red, green, blue)'},
      sqlParser.parseExpression
    )
  ).toThrow('requires exactly 4 arguments');
});

test('SQL colors normalize byte channels with arithmetic and CASE', () => {
  const data = tableFromArrays({gender: [1, 2], altitude: new Float64Array([5000, 2500])});
  const result = evaluateAccessorQueries(
    data,
    {
      categorical: 'RGBA8(0, (CASE WHEN gender = 1 THEN 128 ELSE 0 END) / 255, 0, 1)',
      continuous: 'RGBA8(0, 128 * altitude / (255 * 10000), 0, 1)'
    },
    undefined
  );
  expect(Array.from(result.getChild('categorical')!.get(0))).toEqual([0, 128, 0, 255]);
  expect(Array.from(result.getChild('categorical')!.get(1))).toEqual([0, 0, 0, 255]);
  expect(Array.from(result.getChild('continuous')!.get(0))).toEqual([0, 64, 0, 255]);
  expect(Array.from(result.getChild('continuous')!.get(1))).toEqual([0, 32, 0, 255]);
});

test('default SQL functions extract nested Arrow values without a parser override', () => {
  const data = tableFromArrays({
    start: [[-122, 40, 500], null, [12, 45]],
    endpoint: vectorFromArray(
      [{longitude: -121}, null, {longitude: 13}],
      new Struct([new Field('longitude', new Float64())])
    )
  });
  const columns = evaluateAccessorQueries(
    data,
    {
      longitude: "STRUCT_EXTRACT(endpoint, 'longitude')",
      altitude: 'LIST_EXTRACT(start, 3)',
      position: 'FLOAT64x2(LIST_EXTRACT(start, 1), LIST_EXTRACT(start, 2))'
    },
    undefined
  );
  expect(Array.from(columns.getChild('longitude')!)).toEqual([-121, null, 13]);
  expect(Array.from(columns.getChild('altitude')!)).toEqual([500, null, null]);
  expect(Array.from(columns.getChild('position')!.get(0))).toEqual([-122, 40]);
});

test('layer SQL functions override Deck declarations and changing them reevaluates accessors', async () => {
  const device = new NullDevice({});
  const manager = new LayerManager(device, {viewport: new Viewport()});
  const declaration = (offset: number) => ({
    name: 'ADJUST',
    prototypes: [
      {
        arguments: [new Field('value', new Float64())],
        result: new Field('adjusted', new Float64()),
        evaluate: ([values]) =>
          vectorFromArray(
            Array.from(values, value => value + offset),
            new Float64()
          )
      }
    ]
  });
  const deckFunction = declaration(1);
  const layerFunction = declaration(4);
  const layer = new QueryLayer({
    data: tableFromArrays({x: [2], y: [3]}),
    getPosition: {sql: 'FLOAT64x2(ADJUST(x), y)'}
  });
  try {
    manager.setProps({sqlFunctions: [deckFunction]});
    manager.setLayers([layer]);
    await vi.waitFor(() => expect(layer.isLoaded).toBe(true));
    manager.updateLayers();
    expect(Array.from((layer.props.getPosition as Vector).get(0))).toEqual([3, 3]);
    const next = layer.clone({sqlFunctions: [layerFunction]});
    manager.setLayers([next]);
    await vi.waitFor(() => expect(next.isLoaded).toBe(true));
    manager.updateLayers();
    expect(Array.from((next.props.getPosition as Vector).get(0))).toEqual([6, 3]);
  } finally {
    manager.finalize();
    device.destroy();
  }
});

test('custom declarations override default nested extraction functions', () => {
  const data = tableFromArrays({value: [2]});
  for (const name of ['LIST_EXTRACT', 'STRUCT_EXTRACT']) {
    const result = evaluateAccessorQueries(
      data,
      {adjusted: `${name}(value)`},
      undefined,
      undefined,
      [
        {
          name,
          prototypes: [
            {
              arguments: [new Field('value', new Float64())],
              result: new Field('value', new Float64()),
              evaluate: ([values]) =>
                vectorFromArray(
                  Array.from(values, value => value + 1),
                  new Float64()
                )
            }
          ]
        }
      ]
    );
    expect(Array.from(result.getChild('adjusted')!)).toEqual([3]);
  }
});
