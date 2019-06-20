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

/*
import test from 'tape-catch';
// import {makeSpy} from '@probe.gl/test-utils';
//
// import * as FIXTURES from 'deck.gl-test/data';
//
// import {testLayer, testInitializeLayer, generateLayerTests} from '@deck.gl/test-utils';
//
// import {LineLayer, SolidPolygonLayer} from '@deck.gl/layers';
// import {HeatmapLayer} from '@deck.gl/aggregation-layers';
//
// const getPosition = d => d.COORDINATES;
import {computeCellSize} from '@deck.gl/aggregation-layers/heatmap-layer/heatmap-layer';
test('HeatmapLayer', t => {
  const maxTextureSize = 16384;
  const granularity = [1];
  const TESTS = [
    {
      boundingBox: {xMin: 78.12, xMax: 80.12, yMin: -90.23, yMax: -89.72},
      maxTextureSize
    },
    {
      boundingBox: {xMin: 0, xMax: 100, yMin: 0, yMax: 10},
      maxTextureSize
    },
    {
      boundingBox: {xMin:  -331.1868, xMax: 27.685, yMin: -60.0959, yMax: 79.5651},
      maxTextureSize
    }
  ];

  TESTS.forEach(tc => {
    granularity.forEach(grn => {
      const cellSize = computeCellSize(tc.boundingBox, tc.maxTextureSize);
      const textureSize = [(tc.boundingBox.xMax - tc.boundingBox.xMin)/cellSize[0], (tc.boundingBox.yMax - tc.boundingBox.yMin)/cellSize[1]];
      console.log(`cellSize: ${cellSize} textureSize: ${textureSize}`);
    })
  });
  t.end();
});
*/
