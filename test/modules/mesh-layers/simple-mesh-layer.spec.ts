// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';

import {SimpleMeshLayer} from 'deck.gl';
import {TruncatedConeGeometry} from '@luma.gl/engine';

import * as FIXTURES from 'deck.gl-test/data';

test('SimpleMeshLayer#tests', () => {
  const testCases = generateLayerTests({
    Layer: SimpleMeshLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => (d as any).COORDINATES,
      mesh: new TruncatedConeGeometry({
        topRadius: 1,
        bottomRadius: 1,
        topCap: true,
        bottomCap: true,
        height: 5,
        nradial: 20,
        nvertical: 1
      })
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.mesh) {
        expect(layer.getModels().length > 0, 'Layer should have models').toBeTruthy();
      }
    },
    runDefaultAsserts: false
  });

  testLayer({Layer: SimpleMeshLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
