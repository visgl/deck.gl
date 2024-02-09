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

import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {TerrainLayer, TileLayer} from '@deck.gl/geo-layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TerrainLoader} from '@loaders.gl/terrain';

test('TerrainLayer', async t => {
  const testCases = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      texture: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw',
      loaders: [TerrainLoader]
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        t.ok(subLayers[0] instanceof TileLayer, 'rendered TileLayer');
      }
    }
  });
  await testLayerAsync({Layer: TerrainLayer, testCases, onError: t.notOk});

  const testCasesNonTiled = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/1/0/0.png',
      bounds: [-180, 85, 0, 0],
      loaders: [TerrainLoader]
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        t.ok(subLayers[0] instanceof SimpleMeshLayer, 'rendered SimpleMeshLayer');
      }
    }
  });
  await testLayerAsync({Layer: TerrainLayer, testCases: testCasesNonTiled, onError: t.notOk});

  t.end();
});
