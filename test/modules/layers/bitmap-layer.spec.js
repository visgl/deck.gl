import test from 'tape-promise/tape';

import {COORDINATE_SYSTEM, _GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';
import createMesh from '@deck.gl/layers/bitmap-layer/create-mesh';

import {testPickingLayer} from './test-picking-layer';

test('BitmapLayer#constructor', t => {
  const positionsWithZ = new Float32Array([2, 4, 1, 2, 8, 1, 16, 8, 1, 16, 4, 1]);
  const positions = new Float32Array([2, 4, 0, 2, 8, 0, 16, 8, 0, 16, 4, 0]);

  testLayer({
    Layer: BitmapLayer,
    onError: t.notOk,
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
        updateProps: {
          bounds: [
            [2, 4, 1],
            [2, 8, 1],
            [16, 8, 1],
            [16, 4, 1]
          ]
        },
        onAfterUpdate({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.deepEqual(
            layer.getAttributeManager().attributes.positions.value,
            positionsWithZ,
            'should update positions'
          );
        }
      },
      {
        updateProps: {
          bounds: [2, 4, 16, 8]
        },
        onAfterUpdate({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.deepEqual(
            layer.getAttributeManager().attributes.positions.value,
            positions,
            'should update positions'
          );
        }
      }
    ]
  });

  t.end();
});

test('BitmapLayer#imageCoordinateSystem', t => {
  t.plan(13);

  testLayer({
    Layer: BitmapLayer,
    onError: t.notOk,
    testCases: [
      {
        props: {
          bounds: [-180, -90, 180, 90]
        },
        onAfterUpdate({layer}) {
          t.comment('MapView + default imageCoordinateSystem');

          const {coordinateConversion, bounds} = layer.state;
          t.is(coordinateConversion, 0, 'No coordinate conversion');
          t.deepEqual(bounds, [0, 0, 0, 0], 'Default bounds');
        }
      },
      {
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN
        },
        onAfterUpdate({layer}) {
          t.comment('MapView + imageCoordinateSystem: CARTESIAN');

          const {coordinateConversion, bounds} = layer.state;
          t.is(coordinateConversion, 0, 'No coordinate conversion');
          t.deepEqual(bounds, [0, 0, 0, 0], 'Default bounds');
        }
      },
      {
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
        },
        onAfterUpdate({layer}) {
          t.comment('MapView + imageCoordinateSystem: LNGLAT');

          const {coordinateConversion, bounds} = layer.state;
          t.is(coordinateConversion, -1, 'Convert image coordinate from LNGLAT');
          t.deepEqual(bounds, [-180, -90, 180, 90], 'Generated LNGLAT bounds');
        }
      }
    ]
  });

  testLayer({
    Layer: BitmapLayer,
    onError: t.notOk,
    viewport: new GlobeViewport({width: 800, height: 600, latitude: 0, longitude: 0, zoom: 1}),
    testCases: [
      {
        props: {
          bounds: [0, -30, 45, 0]
        },
        onAfterUpdate({layer}) {
          t.comment('GlobeView + default imageCoordinateSystem');

          const {coordinateConversion, bounds} = layer.state;
          t.is(coordinateConversion, 0, 'No coordinate conversion');
          t.deepEqual(bounds, [0, 0, 0, 0], 'Default bounds');
        }
      },
      {
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN
        },
        onAfterUpdate({layer}) {
          t.comment('GlobeView + imageCoordinateSystem: CARTESIAN');

          const {coordinateConversion, bounds} = layer.state;
          t.is(coordinateConversion, 1, 'Convert image coordinates from WebMercator');
          t.deepEqual(bounds, [256, 211.23850847154438, 320, 256], 'Generated bounds');
        }
      },
      {
        updateProps: {
          _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
        },
        onAfterUpdate({layer}) {
          t.comment('GlobeView + imageCoordinateSystem: LNGLAT');

          const {coordinateConversion, bounds} = layer.state;
          t.is(coordinateConversion, 0, 'No coordinate conversion');
          t.deepEqual(bounds, [0, 0, 0, 0], 'Default bounds');
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
    onError: () => t.pass('Layer should throw if _imageCoordinateSystem is used with quad bounds')
  });
});

test('createMesh', t => {
  const bounds = [
    [0, 0, 0],
    [0, 2, 1],
    [2, 3, 0],
    [2, 1, 1]
  ];

  const result1 = createMesh(bounds);
  t.is(result1.vertexCount, 6, 'returns 1 quad');
  t.is(result1.positions.length, 3 * 4, 'returns 4 vertices');

  const result2 = createMesh(bounds);
  t.is(result1.indices, result2.indices, 'reuses indices array');
  t.is(result1.texCoords, result2.texCoords, 'reuses texCoords array');

  const result3 = createMesh(bounds, 1);
  t.is(result3.vertexCount, 6 * 4, 'returns 4 quads');
  t.is(result3.positions.length, 3 * 9, 'returns 9 vertices');

  t.end();
});

test('BitmapLayer#picking', async t => {
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
          t.deepEqual(
            info.bitmap,
            {
              size: {width: 8, height: 8},
              uv: [0.25, 0.125],
              pixel: [2, 1]
            },
            'info.bitmap populated'
          );
          const uniforms = layer.getModels()[0].getUniforms();
          t.is(uniforms.picking_uSelectedColorValid, 1, `auto highlight is set`);
          t.deepEqual(
            uniforms.picking_uSelectedColor,
            [1, 0, 0],
            'highlighted index is set correctly'
          );
        }
      },
      {
        pickedColor: new Uint8Array([0, 0, 0, 0]),
        pickedLayerId: '',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.notOk(info.bitmap, 'info.bitmap not populated');
          const uniforms = layer.getModels()[0].getUniforms();
          t.is(uniforms.picking_uSelectedColorValid, 0, `auto highlight is cleared`);
        }
      }
    ]
  });

  t.end();
});
