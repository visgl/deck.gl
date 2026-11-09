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
import {vectorFromArray, Utf8, Uint64, List, Field, Dictionary, Int32, Int64} from 'apache-arrow';

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
        cells,
        elevations: vectorFromArray([10, 20]),
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
  const layer = new H3HexagonLayer({cells: vectorFromArray([id], new Uint64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getHexagon(child.props.data[0])).toBe(id.toString(16));
});

test('cell and style counts are validated', () => {
  const layer = new S2Layer({
    cells: vectorFromArray(['89c25']),
    elevations: vectorFromArray([1, 2])
  });
  expect(() => layer.renderLayers()).toThrow('lengths must match');
});

test('H3 column wrapper leaves viewport updates to its child', () => {
  const layer = new H3HexagonLayer({cells: vectorFromArray(['8928308280fffff'])});
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
    cells: vectorFromArray(['89c25']),
    dataTransform: rows => rows,
    dataComparator: () => true,
    _dataDiff: () => []
  });
  const child = layer.renderLayers() as any;
  expect(child.props.dataTransform).toBeFalsy();
  expect(child.props.dataComparator).toBeFalsy();
  expect(child.props._dataDiff).toBeFalsy();
});

test('signed S2 identifiers preserve their unsigned token', () => {
  const cell = BigInt.asIntN(64, 0x89c2500000000000n);
  const layer = new S2Layer({cells: vectorFromArray([cell], new Int64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getS2Token(child.props.data[0])).toBe('89c25');
});

test('Int64 H3 identifiers retain all bits', () => {
  const cell = 0x8928308280fffffn;
  const layer = new H3HexagonLayer({cells: vectorFromArray([cell], new Int64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getHexagon(child.props.data[0])).toBe(cell.toString(16));
});

test('signed A5 identifiers become unsigned bigint values', () => {
  const cell = 0xae80000000000000n;
  const layer = new A5Layer({cells: vectorFromArray([BigInt.asIntN(64, cell)], new Int64())});
  const child = layer.renderLayers() as any;
  expect(child.props.getPentagon(child.props.data[0])).toBe(cell);
});
