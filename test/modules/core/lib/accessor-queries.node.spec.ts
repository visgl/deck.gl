// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {
  Field,
  List,
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
  expect(() => evaluateAccessorQueries(first, expressions, undefined)).toThrow(
    'sqlParser.parseExpression'
  );
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
  try {
    manager.setProps({sqlParser});
    manager.setLayers([first]);
    expect(initialUpdate).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(first.isLoaded).toBe(true));
    manager.updateLayers();
    expect(initialUpdate).toHaveBeenCalledOnce();

    const next = first.clone({data: tableFromArrays({x: [3], y: [4]})});
    const replacementUpdate = vi.spyOn(next, 'updateState');
    manager.setLayers([next]);
    expect(replacementUpdate).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(next.isLoaded).toBe(true));
    manager.updateLayers();
    expect(replacementUpdate).toHaveBeenCalledOnce();
    expect(Array.from((next.props.getPosition as Vector).get(0))).toEqual([3, 4]);
  } finally {
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
