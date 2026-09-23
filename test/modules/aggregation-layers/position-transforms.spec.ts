// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  LayerManager,
  Viewport,
  AttributeManager,
  _CustomProjectionViewport as CustomProjectionViewport
} from '@deck.gl/core';
import {
  ScreenGridLayer,
  GridLayer,
  HexagonLayer,
  ContourLayer,
  HeatmapLayer
} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';

function createViewport(signature: string, projected: boolean, scale = 2, resolution = 1) {
  return projected
    ? new CustomProjectionViewport({
        width: 400,
        height: 300,
        projectionId: signature,
        coordinateSystem: 'meter-offsets',
        projection: {
          forward: ([x, y, z = 0]) => [x * scale, y * scale, z * scale],
          inverse: ([x, y, z = 0]) => [x / scale, y / scale, z / scale]
        },
        outputBounds: [0, 0, 512, 512],
        resolution
      })
    : new Viewport({width: 400, height: 300});
}

const layerCases = [
  [ScreenGridLayer, ['positions']],
  [GridLayer, ['positions']],
  [HexagonLayer, ['positions']],
  [ContourLayer, ['positions']],
  [HeatmapLayer, ['positions']]
] as const;

for (const [LayerType, attributeNames] of layerCases) {
  for (const projected of [false, true]) {
    for (const binary of [false, true]) {
      test(`${LayerType.layerName} position transforms: projected=${projected}, binary=${binary}`, () => {
        const viewport = createViewport('initial', projected);
        const manager = new LayerManager(device, {viewport});
        manager.setProps({
          onError: error => {
            throw error;
          }
        });
        const point = [2, 3, 4];
        const values = new Float64Array(point);
        const attributes = {getPosition: {value: values, size: 3}};
        let layer = new (LayerType as typeof GridLayer)({
          data: binary ? {length: 1, attributes} : [point],
          getPosition: d => d,
          gpuAggregation: false,
          weightsTextureSize: 32
        } as any);
        const check = (expected: number[]) => {
          for (const name of attributeNames) {
            const attribute = layer.getAttributeManager()!.attributes[name];
            expect(attribute.settings.transformSource).toBe('projection');
            expect(Array.from(attribute.value!.slice(0, 3))).toEqual(expected);
          }
        };
        try {
          manager.setLayers([layer]);
          check(projected ? [4, 6, 8] : point);
          layer = layer.clone({modelMatrix: new Matrix4().translate([10, 20, 30])});
          manager.setLayers([layer]);
          check(projected ? [24, 46, 68] : point);
          const changed = createViewport('changed', projected, 3);
          manager.activateViewport(changed);
          layer.activateViewport(changed);
          manager.updateLayers();
          check(projected ? [36, 69, 102] : point);
          expect(point).toEqual([2, 3, 4]);
          expect(Array.from(values)).toEqual(point);
        } finally {
          manager.finalize();
        }
      });
    }
  }
}

test('HeatmapLayer packed position layout composes projection with XY normalization', () => {
  // Exercise the WebGPU attribute declaration without requiring a GPU render target.
  for (const projected of [false, true]) {
    const layer = new HeatmapLayer({});
    const attributes = new AttributeManager(device);
    layer.context = {
      viewport: createViewport('packed', projected),
      device: {type: 'webgpu'}
    } as any;
    vi.spyOn(layer, 'getAttributeManager').mockReturnValue(attributes);
    vi.spyOn(layer, 'setState').mockImplementation(() => {});
    try {
      layer._setupAttributes();
      const position = attributes.attributes.instancePositions;
      expect(position.settings.transformSource).toBe('projection');
      const value = new Float32Array([2, 3]);
      position.setBinaryValue({value, size: 2});
      position.allocate(1);
      position.updateBuffer({
        numInstances: 1,
        data: {length: 1},
        props: layer.props,
        context: layer
      });
      expect(Array.from(position.value!.slice(0, 3))).toEqual(projected ? [4, 6, 0] : [2, 3, 0]);
      expect(Array.from(value)).toEqual([2, 3]);
    } finally {
      attributes.finalize();
      vi.restoreAllMocks();
    }
  }
});
