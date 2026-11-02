// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
import {A5Layer} from '@deck.gl/geo-layers';

const data = [
  // Bigint IDs, resolution 10
  7176167147842830336n,
  7176180341982363648n,
  7175991225982386176n,

  // BigInt binary IDs, resolution 20
  0b0110001110010110001101100011010110100111100000000000000000000000n,
  0b0110001110100000010001110000110001101100111000000000000000000000n,
  0b0110001110100000010001110000110111011110011000000000000000000000n
];

test('A5Layer', () => {
  const testCases = generateLayerTests({
    Layer: A5Layer,
    sampleProps: {
      data,
      getPentagon: d => d
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
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
