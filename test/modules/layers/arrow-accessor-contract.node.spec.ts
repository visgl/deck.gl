// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {
  ArcLayer,
  ColumnLayer,
  IconLayer,
  LineLayer,
  PointCloudLayer,
  ScatterplotLayer
} from '@deck.gl/layers';
import {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {
  H3HexagonLayer,
  H3ClusterLayer,
  S2Layer,
  GeohashLayer,
  QuadkeyLayer,
  A5Layer
} from '@deck.gl/geo-layers';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
import {validateProps} from '../../../modules/core/src/lifecycle/props';
import {resolveColumns} from '../../../modules/core/src/lib/resolve-columns';

const scalar = vectorFromArray([1, 2], new Float32());
const vector = vectorFromArray(
  [
    [0, 0, 0],
    [1, 1, 1]
  ],
  new FixedSizeList(3, new Field('value', new Float32(), false))
);
const pixelOffsets = vectorFromArray(
  [
    [0, 0],
    [1, 1]
  ],
  new FixedSizeList(2, new Field('value', new Float32(), false))
);

const layers = [
  new ScatterplotLayer({
    getPosition: vector,
    getRadius: scalar,
    getLineWidth: scalar,
    getFillColor: vector,
    getLineColor: vector
  }),
  new ArcLayer({
    getSourcePosition: vector,
    getTargetPosition: vector,
    getSourceColor: vector,
    getTargetColor: vector,
    getWidth: scalar,
    getHeight: scalar,
    getTilt: scalar
  }),
  new LineLayer({
    getSourcePosition: vector,
    getTargetPosition: vector,
    getColor: vector,
    getWidth: scalar
  }),
  new PointCloudLayer({getPosition: vector, getNormal: vector, getColor: vector}),
  new ColumnLayer({
    getPosition: vector,
    getFillColor: vector,
    getLineColor: vector,
    getElevation: scalar,
    getLineWidth: scalar
  }),
  new IconLayer({
    getPosition: vector,
    getColor: vector,
    getSize: scalar,
    getAngle: scalar,
    getPixelOffset: pixelOffsets
  }),
  new SimpleMeshLayer({getPosition: vector, getColor: vector}),
  new ScenegraphLayer({getPosition: vector, getColor: vector})
];

for (const layer of layers) {
  test(`${layer.constructor.name} accepts Arrow accessors and rejects GPU accessors`, () => {
    expect(() => validateProps(layer.props)).not.toThrow();
    const device = new NullDevice({});
    const buffer = device.createBuffer({data: new Float32Array([1, 2])});
    const gpu = new GPUVector({
      type: 'buffer',
      name: 'scalar',
      buffer,
      format: 'float32',
      length: 2,
      ownsBuffer: false
    });
    try {
      for (const name of Object.keys(layer.props).filter(
        name =>
          layer.props[name] === vector ||
          layer.props[name] === scalar ||
          layer.props[name] === pixelOffsets
      )) {
        expect(() => validateProps(layer.clone({[name]: gpu}).props)).toThrow(name);
      }
      const definitions = {colors: {accessor: 'getColor', arrowAccessor: true}};
      expect(() => resolveColumns({colors: vector}, definitions)).toThrow('requires a GPUVector');
      expect(resolveColumns({colors: gpu, getColor: vector}, definitions).colors).toBe(gpu);
      expect(buffer.destroyed).toBe(false);
    } finally {
      gpu.destroy();
      buffer.destroy();
      device.destroy();
    }
  });
}

for (const [LayerClass, accessor] of [
  [H3HexagonLayer, 'getHexagon'],
  [H3ClusterLayer, 'getHexagons'],
  [S2Layer, 'getS2Token'],
  [GeohashLayer, 'getGeohash'],
  [QuadkeyLayer, 'getQuadkey'],
  [A5Layer, 'getPentagon']
] as const) {
  test(`${LayerClass.layerName} validates Arrow identifier and style accessors`, () => {
    const layer = new LayerClass({
      [accessor]: vectorFromArray(['89c25']),
      getElevation: scalar,
      getLineWidth: scalar,
      getFillColor: vector,
      getLineColor: vector
    });
    expect(() => validateProps(layer.props)).not.toThrow();
  });
}

test('callback defaults allow constant positions on Arrow-enabled accessors', () => {
  const position = [0, 0, 0] as const;
  for (const layer of [
    new ScatterplotLayer({getPosition: position}),
    new ArcLayer({getSourcePosition: position, getTargetPosition: position}),
    new ColumnLayer({getPosition: position}),
    new PointCloudLayer({getPosition: position})
  ]) {
    expect(() => validateProps(layer.props)).not.toThrow();
  }
});
