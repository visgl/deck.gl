// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

import {COORDINATE_SYSTEM, _GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';
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
    onError: () => {}
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
