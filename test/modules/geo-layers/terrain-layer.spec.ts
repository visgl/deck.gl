// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {TerrainLayer, TileLayer} from '@deck.gl/geo-layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TerrainLoader} from '@loaders.gl/terrain';

test('TerrainLayer', async () => {
  const testCases = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      texture: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw',
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof TileLayer, 'rendered TileLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({Layer: TerrainLayer, testCases, onError: err => expect(err).toBeFalsy()});

  const testCasesNonTiled = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/1/0/0.png',
      bounds: [-180, 85, 0, 0],
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof SimpleMeshLayer, 'rendered SimpleMeshLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({
    Layer: TerrainLayer,
    testCases: testCasesNonTiled,
    onError: err => expect(err).toBeFalsy()
  });
});
