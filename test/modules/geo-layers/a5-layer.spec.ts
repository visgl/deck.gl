// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {A5Layer} from '@deck.gl/geo-layers';

const data = [
  // Bigint IDs, resolution 10
  7160826761612099584n,
  7160839955751632896n,
  7160980693239988224n,

  // BigInt binary IDs, resolution 20
  0b0110001101100000111001011000010110100100100000000000000000000000n,
  0b0110001101011111101100010000100010111011111000000000000000000000n,
  0b0110001101011111101100010000100111000110011000000000000000000000n
];

test('A5Layer', () => {
  const testCases = generateLayerTests({
    Layer: A5Layer,
    sampleProps: {
      data,
      getPentagon: d => d
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      expect(subLayer, 'subLayers rendered').toBeTruthy();

      if (layer.props.data.length) {
        expect(subLayer.state.paths.length, 'should update PolygonLayers state.paths').toBe(
          data.length
        );
      }
    }
  });

  testLayer({Layer: A5Layer, testCases, onError: err => expect(err).toBeFalsy()});
});
