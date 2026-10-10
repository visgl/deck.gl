// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {
  COORDINATE_SYSTEM,
  _GlobeViewport as GlobeViewport,
  _CustomProjectionViewport as CustomProjectionViewport
} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils/vitest';
import createMesh from '@deck.gl/layers/bitmap-layer/create-mesh';

import {testPickingLayer} from './test-picking-layer';

test('BitmapLayer#constructor', () => {
  const positionsWithZ = new Float32Array([2, 4, 1, 2, 8, 1, 16, 8, 1, 16, 4, 1]);
  const positions = new Float32Array([2, 4, 0, 2, 8, 0, 16, 8, 0, 16, 4, 0]);

  testLayer({
    Layer: BitmapLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        title: 'positions from 3D bounds',
        updateProps: {
          bounds: [
            [2, 4, 1],
            [2, 8, 1],
            [16, 8, 1],
            [16, 4, 1]
          ]
        },
        onAfterUpdate({layer, oldState}) {
          expect(layer.state, 'should update layer state').toBeTruthy();
          expect(
            layer.getAttributeManager()!.attributes.positions.value,
            'should update positions'
          ).toEqual(positionsWithZ);
        }
      },
      {
        title: 'positions from 2D bounds',
        updateProps: {
          bounds: [2, 4, 16, 8]
        },
        onAfterUpdate({layer, oldState}) {
          expect(layer.state, 'should update layer state').toBeTruthy();
          expect(
            layer.getAttributeManager()!.attributes.positions.value,
            'should update positions'
          ).toEqual(positions);
        }
      }
    ]
  });
});

test('BitmapLayer#imageCoordinateSystem with preprojection', () => {
  const viewport = new CustomProjectionViewport({
    width: 800,
    height: 600,
    projection: {
      forward: ([x, y, z = 0]) => [x * 2, y * 2, z],
      inverse: ([x, y, z = 0]) => [x / 2, y / 2, z]
    }
  });
  const bounds: NonNullable<BitmapLayer['props']['bounds']>[] = [
    [0, -30, 45, 0],
    [
      [0, -30],
      [0, 0],
      [45, 0],
      [45, -30]
    ]
  ];
  for (const imageBounds of bounds) {
    testLayer({
      Layer: BitmapLayer,
      viewport,
      onError: error => {
        throw error;
      },
      testCases: (['default', 'cartesian', 'lnglat'] as const).map(imageCoordinateSystem => ({
        title: `CustomProjectionView + imageCoordinateSystem: ${imageCoordinateSystem}`,
        props: {bounds: imageBounds, _imageCoordinateSystem: imageCoordinateSystem},
        onAfterUpdate({layer}) {
          expect(layer.state.coordinateConversion).toBe(0);
          expect(layer.state.bounds).toEqual([0, 0, 0, 0]);
          expect(layer.state.mesh.texCoords.length).toBeGreaterThan(0);
        }
      }))
    });
  }
});

test('BitmapLayer#imageCoordinateSystem', () => {
  testLayer({
    Layer: BitmapLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'MapView + default imageCoordinateSystem',
        props: {
          bounds: [-180, -90, 180, 90]
        },
        onAfterUpdate({layer}) {
          const {coordinateConversion, bounds} = layer.state;
          expect(coordinateConversion, 'No coordinate conversion').toBe(0);
          expect(bounds, 'Default bounds').toEqual([0, 0, 0, 0]);
        }
      },
      {
        title: 'MapView + imageCoordinateSystem: CARTESIAN',
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN
        },
        onAfterUpdate({layer}) {
          const {coordinateConversion, bounds} = layer.state;
          expect(coordinateConversion, 'No coordinate conversion').toBe(0);
          expect(bounds, 'Default bounds').toEqual([0, 0, 0, 0]);
        }
      },
      {
        title: 'MapView + imageCoordinateSystem: LNGLAT',
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
        },
        onAfterUpdate({layer}) {
          const {coordinateConversion, bounds} = layer.state;
          expect(coordinateConversion, 'Convert image coordinate from LNGLAT').toBe(-1);
          expect(bounds, 'Generated LNGLAT bounds').toEqual([-180, -90, 180, 90]);
        }
      }
    ]
  });

  testLayer({
    Layer: BitmapLayer,
    onError: err => expect(err).toBeFalsy(),
    viewport: new GlobeViewport({width: 800, height: 600, latitude: 0, longitude: 0, zoom: 1}),
    testCases: [
      {
        title: 'GlobeView + default imageCoordinateSystem',
        props: {
          bounds: [0, -30, 45, 0]
        },
        onAfterUpdate({layer}) {
          const {coordinateConversion, bounds} = layer.state;
          expect(coordinateConversion, 'No coordinate conversion').toBe(0);
          expect(bounds, 'Default bounds').toEqual([0, 0, 0, 0]);
        }
      },
      {
        title: 'GlobeView + imageCoordinateSystem: CARTESIAN',
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN
        },
        onAfterUpdate({layer}) {
          const {coordinateConversion, bounds} = layer.state;
          expect(coordinateConversion, 'Convert image coordinates from WebMercator').toBe(1);
          expect(bounds, 'Generated bounds').toEqual([256, 211.23850847154438, 320, 256]);
        }
      },
      {
        title: 'GlobeView + imageCoordinateSystem: LNGLAT',
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
        },
        onAfterUpdate({layer}) {
          const {coordinateConversion, bounds} = layer.state;
          expect(coordinateConversion, 'No coordinate conversion').toBe(0);
          expect(bounds, 'Default bounds').toEqual([0, 0, 0, 0]);
        }
      }
    ]
  });

  testInitializeLayer({
    layer: new BitmapLayer({
      bounds: [
        [0, 0, 0],
        [0, 2, 1],
        [2, 3, 0],
        [2, 1, 1]
      ],
      _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN
    }),
    onError: () =>
      console.log('Layer should throw if _imageCoordinateSystem is used with quad bounds')
  });
});

test('createMesh', () => {
  const bounds = [
    [0, 0, 0],
    [0, 2, 1],
    [2, 3, 0],
    [2, 1, 1]
  ];

  const result1 = createMesh(bounds);
  expect(result1.vertexCount, 'returns 1 quad').toBe(6);
  expect(result1.positions.length, 'returns 4 vertices').toBe(3 * 4);

  const result2 = createMesh(bounds);
  expect(result1.indices, 'reuses indices array').toBe(result2.indices);
  expect(result1.texCoords, 'reuses texCoords array').toBe(result2.texCoords);

  const result3 = createMesh(bounds, 1);
  expect(result3.vertexCount, 'returns 4 quads').toBe(6 * 4);
  expect(result3.positions.length, 'returns 9 vertices').toBe(3 * 9);
});

test('BitmapLayer#picking', async () => {
  await testPickingLayer({
    layer: new BitmapLayer({
      id: 'image',
      image: {
        width: 8,
        height: 8,
        data: new Uint8Array(8 * 8 * 4).fill(200)
      },
      bounds: [0, 0, 1, 1],
      pickable: true,
      autoHighlight: true
    }),
    testCases: [
      {
        pickedColor: new Uint8Array([64, 32, 0, 0]),
        pickedLayerId: 'image',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          expect(info.bitmap, 'info.bitmap populated').toEqual({
            size: {width: 8, height: 8},
            uv: [0.25, 0.125],
            pixel: [2, 1]
          });
          const uniforms = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(uniforms.picking.isHighlightActive, `auto highlight is set`).toBe(true);
          expect(
            uniforms.picking.highlightedObjectColor,
            'highlighted index is set correctly'
          ).toEqual([1, 0, 0]);
        }
      },
      {
        pickedColor: new Uint8Array([0, 0, 0, 0]),
        pickedLayerId: '',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          expect(info.bitmap, 'info.bitmap not populated').toBeFalsy();
          const uniforms = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(uniforms.picking.isHighlightActive, `auto highlight is cleared`).toBe(false);
        }
      }
    ]
  });
});

test('adaptive bitmap mesh preserves bilinear UVs, altitude and seed indices', () => {
  const bounds = [
    [0, 0, 2],
    [0, 2, 4],
    [3, 3, 8],
    [2, 0, 6]
  ];
  const seed = createMesh(bounds, 0);
  const originalIndices = Array.from(seed.indices);
  const transform = ([x, y, z]) => [x, y + x * x, z];
  const mesh = createMesh(bounds, 0, {transform, tolerance: 0.05});
  expect(mesh.positions.length).toBeGreaterThan(seed.positions.length);
  for (let i = 0; i < mesh.positions.length / 3; i++) {
    const u = mesh.texCoords[2 * i],
      v = 1 - mesh.texCoords[2 * i + 1];
    const expected = [0, 1, 2].map(
      axis =>
        (1 - u) * ((1 - v) * bounds[0][axis] + v * bounds[1][axis]) +
        u * ((1 - v) * bounds[3][axis] + v * bounds[2][axis])
    );
    expected.forEach((value, axis) => expect(mesh.positions[3 * i + axis]).toBeCloseTo(value, 6));
    const projected = transform(expected);
    projected.forEach((value, axis) =>
      expect(mesh.projectedPositions![3 * i + axis]).toBeCloseTo(value, 6)
    );
  }
  expect(Array.from(seed.indices)).toEqual(originalIndices);
  expect(Array.from(createMesh(bounds, 0).indices)).toEqual(originalIndices);
});

test('adaptive bitmap rebuilds on modelMatrix changes and disabling refinement', () => {
  const viewport = new CustomProjectionViewport({
    projection: {
      forward: ([x, y, z = 0]) => [x, y + x * x, z],
      inverse: ([x, y, z = 0]) => [x, y - x * x, z]
    }
  });
  testLayer({
    Layer: BitmapLayer,
    viewport,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          bounds: [
            [0, 0, 2],
            [0, 2, 4],
            [3, 3, 8],
            [2, 0, 6]
          ],
          _projectionTolerance: 0.05
        },
        onAfterUpdate({layer}) {
          expect(layer.state.mesh.projectedPositions).toBeTruthy();
        }
      },
      {
        updateProps: {modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1]},
        onAfterUpdate({layer, oldState}) {
          expect(layer.state.mesh).not.toBe(oldState.mesh);
          expect(layer.state.mesh.projectedPositions[0]).toBe(2);
          expect(layer.getAttributeManager()!.attributes.positions.value[0]).toBe(2);
        }
      },
      {
        updateProps: {_projectionTolerance: 0},
        onAfterUpdate({layer}) {
          expect(layer.state.mesh.projectedPositions).toBeUndefined();
          expect(layer.state.mesh.positions.length).toBe(12);
          expect(layer.getAttributeManager()!.attributes.positions.value[0]).toBe(2);
        }
      }
    ]
  });
});
