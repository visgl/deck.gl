// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  H3HexagonLayer,
  H3ClusterLayer,
  S2Layer,
  GeohashLayer,
  QuadkeyLayer,
  A5Layer
} from '@deck.gl/geo-layers';
import {
  Table,
  vectorFromArray,
  Utf8,
  Uint64,
  List,
  Field,
  Dictionary,
  Int32,
  Int64
} from 'apache-arrow';

const cases = [
  [H3HexagonLayer, 'getHexagon', '8928308280fffff'],
  [H3ClusterLayer, 'getHexagons', '8928308280fffff'],
  [S2Layer, 'getS2Token', '89c25'],
  [GeohashLayer, 'getGeohash', '9q8yy'],
  [QuadkeyLayer, 'getQuadkey', '120'],
  [A5Layer, 'getPentagon', '2e80000000000000']
] as const;

for (const [Layer, accessor, cell] of cases) {
  for (const dictionary of [false, true]) {
    test(`${Layer.layerName} preserves feature styling and picking for list cells (dictionary=${dictionary})`, () => {
      const type = dictionary ? new Dictionary(new Utf8(), new Int32()) : new Utf8();
      const cells = vectorFromArray([[cell, cell], [cell]], new List(new Field('cell', type)));
      const rows = [{name: 'first'}, {name: 'second'}];
      const layer = new Layer({
        id: 'cells',
        data: rows,
        [accessor]: cells,
        getElevation: vectorFromArray([10, 20]),
        getFillColor: (_: unknown, info: {index: number}) => [info.index, 0, 0, 255]
      } as never);
      const child = layer.renderLayers() as any;
      const expanded = child.props.data;
      expect(expanded.length).toBe(accessor === 'getHexagons' ? 2 : 3);
      const last = expanded[expanded.length - 1];
      expect(child.props.getElevation(last, {index: 2})).toBe(20);
      expect(child.props.getFillColor(last, {index: 2})).toEqual([1, 0, 0, 255]);
      const info = layer.getPickingInfo({
        info: {index: expanded.length - 1, object: last}
      } as never);
      expect(info.index).toBe(1);
      expect(info.object).toBe(rows[1]);
      expect(child.props[accessor](last)).toEqual(accessor === 'getHexagons' ? [cell] : cell);
    });
  }
}

test('numeric H3 cells retain uint64 precision', () => {
  const id = 0x8928308280fffffn;
  const layer = new H3HexagonLayer({getHexagon: vectorFromArray([id], new Uint64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getHexagon(child.props.data[0])).toBe(id.toString(16));
});

test('cell and style counts are validated', () => {
  const layer = new S2Layer({
    getS2Token: vectorFromArray(['89c25']),
    getElevation: vectorFromArray([1, 2])
  });
  expect(() => layer.renderLayers()).toThrow('lengths must match');
});

test('H3 column wrapper leaves viewport updates to its child', () => {
  const layer = new H3HexagonLayer({getHexagon: vectorFromArray(['8928308280fffff'])});
  expect(
    layer.shouldUpdateState({
      props: layer.props,
      changeFlags: {
        propsOrDataChanged: false,
        somethingChanged: true,
        viewportChanged: true
      }
    } as never)
  ).toBe(false);
});

test('generated rows clear source data hooks', () => {
  const layer = new S2Layer({
    getS2Token: vectorFromArray(['89c25']),
    dataTransform: rows => rows,
    dataComparator: () => true,
    _dataDiff: () => []
  });
  const child = layer.renderLayers() as any;
  expect(child.props.dataTransform).toBeFalsy();
  expect(child.props.dataComparator).not.toBe(layer.props.dataComparator);
  expect(child.props.dataComparator(child.props.data, [])).toBe(false);
  expect(child.props._dataDiff).toBeFalsy();
});

test('signed S2 identifiers preserve their unsigned token', () => {
  const cell = BigInt.asIntN(64, 0x89c2500000000000n);
  const layer = new S2Layer({getS2Token: vectorFromArray([cell], new Int64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getS2Token(child.props.data[0])).toBe('89c25');
});

test('Int64 H3 identifiers retain all bits', () => {
  const cell = 0x8928308280fffffn;
  const layer = new H3HexagonLayer({getHexagon: vectorFromArray([cell], new Int64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getHexagon(child.props.data[0])).toBe(cell.toString(16));
});

test('signed A5 identifiers become unsigned bigint values', () => {
  const cell = 0xae80000000000000n;
  const layer = new A5Layer({getPentagon: vectorFromArray([BigInt.asIntN(64, cell)], new Int64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getPentagon(child.props.data[0])).toBe(cell);
});

test('cell rows compare source features by identity, including cyclic and built-in objects', () => {
  const cells = vectorFromArray(['8928308280fffff']);
  const source: any = {date: new Date(0), values: new Map([['height', 1]])};
  source.self = source;
  const makeRows = (feature: any) =>
    (new H3ClusterLayer({getHexagons: cells, data: [feature]}).renderLayers() as any).props;
  const first = makeRows(source);
  const same = makeRows(source);
  expect(same.dataComparator(same.data, first.data)).toBe(true);
  const changed: any = {date: new Date(1), values: new Map([['height', 2]])};
  changed.self = changed;
  const next = makeRows(changed);
  expect(next.dataComparator(next.data, first.data)).toBe(false);
});

test('Arrow source-table identity survives fresh row wrappers', () => {
  const data = new Table({value: vectorFromArray([1])});
  const cells = vectorFromArray(['89c25']);
  const makeRows = table =>
    (new S2Layer({data: table, getS2Token: cells}).renderLayers() as any).props;
  const first = makeRows(data);
  const next = makeRows(data);
  expect(first.data[0].__source.object).not.toBe(next.data[0].__source.object);
  expect(next.dataComparator(next.data, first.data)).toBe(true);
  const changed = makeRows(new Table({value: vectorFromArray([2])}));
  expect(changed.dataComparator(changed.data, first.data)).toBe(false);
});

test('cell style accessors accept Arrow columns alongside identifier callbacks', () => {
  const data = [{cell: '89c25'}, {cell: '89c25'}];
  const layer = new S2Layer({
    data,
    getS2Token: (row, info) => {
      expect(info.data).toBe(data);
      expect(info.target).toEqual([]);
      expect(data[info.index]).toBe(row);
      return row.cell;
    },
    getElevation: vectorFromArray([10, 20])
  });
  const child = layer.renderLayers() as any;
  expect(child.props.data).toHaveLength(2);
  expect(child.props.getS2Token(child.props.data[0])).toBe('89c25');
  expect(child.props.getElevation(child.props.data[1], {index: 1})).toBe(20);
});
