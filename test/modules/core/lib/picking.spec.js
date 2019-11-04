// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
import {processPickInfo} from '@deck.gl/core/lib/picking/pick-info';
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {testInitializeLayer} from '@deck.gl/test-utils';

import {equals} from 'math.gl';

const testLayer = new ScatterplotLayer({
  id: 'test-layer',
  data: ['a', 'b'],
  getPosition: d => [0, 0],
  autoHighlight: true
});

const testCompositeLayer = new GeoJsonLayer({
  id: 'test-composite-layer',
  data: [{type: 'Feature', geometry: {type: 'Point', coordinates: [0, 0]}}]
});

const parameters = {
  mode: 'hover',
  viewports: [
    new WebMercatorViewport({
      longitude: -122,
      latitude: 38,
      zoom: 1,
      width: 200,
      height: 200
    })
  ],
  layers: [testLayer, testCompositeLayer],
  x: 100,
  y: 100,
  deviceX: 200,
  deviceY: 200,
  pixelRatio: 2
};

test('processPickInfo', t => {
  testInitializeLayer({layer: testLayer});
  testInitializeLayer({layer: testCompositeLayer});

  const TEST_CASES = [
    {
      pickInfo: {
        pickedColor: null,
        pickedLayer: null,
        pickedObjectIndex: -1
      },
      size: 1,
      info: {layer: null, index: -1, picked: false, x: 100, coordinate: [-122, 38]},
      lastPickedInfo: {layerId: null, index: -1},
      testLayerUniforms: {picking_uSelectedColorValid: 0}
    },
    {
      pickInfo: {
        pickedColor: [1, 0, 0, 0],
        pickedLayer: testLayer,
        pickedObjectIndex: 0
      },
      size: 2,
      info: {layer: testLayer, object: 'a', index: 0, picked: true, x: 100, coordinate: [-122, 38]},
      lastPickedInfo: {layerId: 'test-layer', index: 0},
      testLayerUniforms: {picking_uSelectedColorValid: 1, picking_uSelectedColor: [1, 0, 0]}
    },
    {
      pickInfo: {
        pickedColor: [2, 0, 0, 0],
        pickedLayer: testLayer,
        pickedObjectIndex: 1
      },
      size: 2,
      info: {layer: testLayer, object: 'b'},
      lastPickedInfo: {layerId: 'test-layer', index: 1},
      testLayerUniforms: {picking_uSelectedColorValid: 1, picking_uSelectedColor: [2, 0, 0]}
    },
    {
      pickInfo: {
        pickedColor: [1, 0, 0, 0],
        pickedLayer: testCompositeLayer.getSubLayers()[0],
        pickedObjectIndex: 0
      },
      size: 3,
      info: {
        layer: testCompositeLayer,
        object: {type: 'Feature', geometry: {type: 'Point', coordinates: [0, 0]}}
      },
      lastPickedInfo: {layerId: 'test-composite-layer-points', index: 0},
      testLayerUniforms: {picking_uSelectedColorValid: 0}
    }
  ];

  const lastPickedInfo = {};
  parameters.lastPickedInfo = lastPickedInfo;

  const testLayerUniforms = testLayer.getModels()[0].getUniforms();

  for (const testCase of TEST_CASES) {
    parameters.pickInfo = testCase.pickInfo;
    const infos = processPickInfo(parameters);
    t.is(infos.size, testCase.size, 'returns expected infos');

    const info = infos.get(testCase.info.layer && testCase.info.layer.id);

    for (const key in testCase.info) {
      const expected = testCase.info[key];
      if (Number.isFinite(expected) || Array.isArray(expected)) {
        t.ok(equals(info[key], expected), `info.${key}`);
      } else {
        t.deepEqual(info[key], expected, `info.${key}`);
      }
    }
    for (const key in testCase.lastPickedInfo) {
      t.deepEqual(lastPickedInfo[key], testCase.lastPickedInfo[key], `lastPickedInfo.${key}`);
    }
    for (const key in testCase.testLayerUniforms) {
      t.deepEqual(
        testLayerUniforms[key],
        testCase.testLayerUniforms[key],
        `testLayerUniforms.${key}`
      );
    }
  }

  testLayer._finalize();
  testCompositeLayer._finalize();

  t.end();
});
