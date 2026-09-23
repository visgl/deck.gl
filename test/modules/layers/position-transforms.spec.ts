// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  LayerManager,
  Viewport,
  _CustomProjectionViewport as CustomProjectionViewport
} from '@deck.gl/core';
import {
  ArcLayer,
  BitmapLayer,
  ColumnLayer,
  GridCellLayer,
  IconLayer,
  LineLayer,
  PointCloudLayer,
  ScatterplotLayer,
  _TextBackgroundLayer as TextBackgroundLayer
} from '@deck.gl/layers';
import {SimpleMeshLayer, ScenegraphLayer} from '@deck.gl/mesh-layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {shouldComposeModelMatrix} from '@deck.gl/mesh-layers/utils/matrix';

function createViewport(signature: string, projected: boolean, scale = 2, resolution = 1) {
  return projected
    ? new CustomProjectionViewport({
        width: 400,
        height: 300,
        projectionId: signature,
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
  [ScatterplotLayer, ['instancePositions']],
  [IconLayer, ['instancePositions']],
  [TextBackgroundLayer, ['instancePositions']],
  [ColumnLayer, ['instancePositions']],
  [GridCellLayer, ['instancePositions']],
  [PointCloudLayer, ['instancePositions']],
  [LineLayer, ['instanceSourcePositions', 'instanceTargetPositions']],
  [ArcLayer, ['instanceSourcePositions', 'instanceTargetPositions']],
  [SimpleMeshLayer, ['instancePositions']],
  [ScenegraphLayer, ['instancePositions']]
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
        const attributes = Object.fromEntries(
          ['getPosition', 'getSourcePosition', 'getTargetPosition'].map(name => [
            name,
            {value: values, size: 3}
          ])
        );
        let layer = new (LayerType as typeof ScatterplotLayer)({
          data: binary ? {length: 1, attributes} : [point],
          getPosition: d => d,
          getSourcePosition: d => d,
          getTargetPosition: d => d,
          iconAtlas: document.createElement('canvas'),
          iconMapping: {point: {x: 0, y: 0, width: 1, height: 1}},
          getIcon: () => 'point',
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

test('BitmapLayer transforms tessellated vertices without mutating the input mesh', () => {
  const viewport = createViewport('initial', true);
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  let layer = new BitmapLayer({bounds: [2, 3, 4, 5]});
  try {
    manager.setLayers([layer]);
    const source = layer.state.mesh.positions.slice();
    expect(source.length).toBeGreaterThan(12);
    const check = (scale: number, offset = 0) => {
      const positions = layer.getAttributeManager()!.attributes.positions.value!;
      for (let i = 0; i < source.length; i++) {
        expect(positions[i]).toBeCloseTo((source[i] + (i % 3 === 0 ? offset : 0)) * scale);
      }
      expect(layer.state.mesh.positions).toEqual(source);
    };
    check(2);
    layer = layer.clone({modelMatrix: new Matrix4().translate([10, 0, 0])});
    manager.setLayers([layer]);
    check(2, 10);
    const changed = createViewport('changed', true, 3);
    manager.activateViewport(changed);
    layer.activateViewport(changed);
    check(3, 10);
    const finer = createViewport('finer', true, 3, 0.5);
    manager.activateViewport(finer);
    layer.activateViewport(finer);
    expect(layer.state.mesh.positions.length).toBeGreaterThan(source.length);
  } finally {
    manager.finalize();
  }
});

test('Instanced meshes retain meter-sized geometry around preprojected anchors', () => {
  for (const coordinateSystem of ['default', 'cartesian', 'meter-offsets', 'lnglat']) {
    expect(shouldComposeModelMatrix(createViewport('custom', true), coordinateSystem)).toBe(false);
  }
  expect(shouldComposeModelMatrix(new Viewport(), 'cartesian')).toBe(true);
});
