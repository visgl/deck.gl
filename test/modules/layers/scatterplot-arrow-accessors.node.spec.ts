// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {ScatterplotLayer, type ScatterplotLayerProps} from '@deck.gl/layers';
import {Field, FixedSizeList, Float32, Float64, Int16, Uint8, vectorFromArray} from 'apache-arrow';
import {validateProps, diffProps} from '../../../modules/core/src/lifecycle/props';
import {resolveColumns} from '../../../modules/core/src/lib/resolve-columns';
import {
  hasScatterplotColumns,
  SCATTERPLOT_COLUMN_DEFINITIONS,
  ScatterplotLayerColumns
} from '../../../modules/layers/src/scatterplot-layer/scatterplot-layer-columns';

const radii = vectorFromArray([2, 4], new Int16());
const colors = vectorFromArray(
  [
    [1, 0.5, 0],
    [0, 0, 1]
  ],
  new FixedSizeList(3, new Field('value', new Float32(), false))
);

// Compile-time boundary: columns are accepted only by the opted-in accessors.
const arrowProps: ScatterplotLayerProps = {
  id: 'types',
  data: [],
  getRadius: radii,
  getFillColor: colors
};
function checkAccessorTypes(gpu: GPUVector) {
  // @ts-expect-error GPU vectors remain exclusive to column props.
  const radius: ScatterplotLayerProps = {id: 'types', data: [], getRadius: gpu};
  // @ts-expect-error GPU vectors remain exclusive to column props.
  const color: ScatterplotLayerProps = {id: 'types', data: [], getFillColor: gpu};
  // @ts-expect-error Pixel offset accessors have not opted into Arrow columns.
  const position: ScatterplotLayerProps = {id: 'types', data: [], getPixelOffset: colors};
  // @ts-expect-error Experimental column props accept GPU vectors only.
  const column: ScatterplotLayerProps = {id: 'types', data: [], radii};
  return [radius, color, position, column];
}
void checkAccessorTypes;

test('Scatterplot validates Arrow accessors and compares column identity', () => {
  const layer = new ScatterplotLayer(arrowProps);
  expect(() => validateProps(layer.props)).not.toThrow();
  expect(hasScatterplotColumns(layer.props)).toBe(true);
  expect(diffProps(layer.clone({getRadius: radii}).props, layer.props).propsChanged).toBe(false);
  expect(
    diffProps(layer.clone({getRadius: radii.slice()}).props, layer.props).propsChanged
  ).toBeTruthy();
  expect(diffProps(layer.clone({getRadius: () => 1}).props, layer.props).propsChanged).toBeTruthy();
  expect(() => validateProps(new ScatterplotLayer({getPixelOffset: colors as any}).props)).toThrow(
    'getPixelOffset'
  );
});

test('Arrow accessors select columns without a competing CPU column prop', () => {
  expect(resolveColumns({getRadius: radii}, SCATTERPLOT_COLUMN_DEFINITIONS).radii).toBe(radii);
  expect(() => resolveColumns({radii}, SCATTERPLOT_COLUMN_DEFINITIONS)).toThrow(
    'requires a GPUVector'
  );
  expect(resolveColumns({getRadius: radii}, {radii: {accessor: 'getRadius'}})).toEqual({});
  expect(hasScatterplotColumns(new ScatterplotLayer({getRadius: 2}).props)).toBe(false);
});

test('GPU vectors are rejected as accessors and remain borrowed column inputs', () => {
  const device = new NullDevice({});
  const buffer = device.createBuffer({data: new Float32Array([2, 4])});
  const vector = new GPUVector({
    type: 'buffer',
    name: 'radii',
    buffer,
    format: 'float32',
    length: 2,
    ownsBuffer: false
  });
  try {
    for (const accessor of ['getRadius', 'getLineWidth', 'getFillColor', 'getLineColor']) {
      expect(() => validateProps(new ScatterplotLayer({[accessor]: vector}).props)).toThrow(
        accessor
      );
      expect(resolveColumns({[accessor]: vector}, SCATTERPLOT_COLUMN_DEFINITIONS)).toEqual({});
    }
    expect(resolveColumns({radii: vector}, SCATTERPLOT_COLUMN_DEFINITIONS).radii).toBe(vector);
    expect(buffer.destroyed).toBe(false);
  } finally {
    vector.destroy();
    buffer.destroy();
    device.destroy();
  }
});

test('Arrow accessors share conversion, validation and replacement with column props', async () => {
  const device = new NullDevice({});
  const columns = new ScatterplotLayerColumns(device);
  const failed = vi.fn();
  const input = new ScatterplotLayer({
    data: [{position: [0, 0]}, {position: [1, 1]}],
    getRadius: radii,
    getLineWidth: vectorFromArray([0.5, 1.5], new Float64()),
    getFillColor: colors,
    getLineColor: vectorFromArray(
      [
        [255, 0, 0, 128],
        [0, 255, 0, 255]
      ],
      new FixedSizeList(4, new Field('value', new Uint8(), false))
    )
  }).props;
  try {
    await columns.update(input, () => {}, failed);
    expect(failed).not.toHaveBeenCalled();
    expect(columns.length).toBe(2);
    const previous = (columns as any).prepared;
    expect(previous.columns.instanceRadius.format).toBe('float32');
    expect(previous.columns.instanceLineWidths.format).toBe('float32');
    expect(previous.columns.instanceFillColors.format).toBe('unorm8x4');
    const buffer = previous.columns.instanceRadius.data[0].buffer;
    for (const invalid of [
      vectorFromArray([1], new Float32()),
      vectorFromArray([1, null], new Float32())
    ]) {
      await columns.update({...input, getRadius: invalid}, () => {}, failed);
      expect((columns as any).prepared).toBe(previous);
      expect(buffer.destroyed).toBe(false);
    }
    expect(failed).toHaveBeenCalledTimes(2);
    await columns.update({...input, getRadius: () => 3}, () => {}, failed);
    expect(buffer.destroyed).toBe(true);
    expect(failed).toHaveBeenCalledTimes(2);
  } finally {
    columns.destroy();
    device.destroy();
  }
});
