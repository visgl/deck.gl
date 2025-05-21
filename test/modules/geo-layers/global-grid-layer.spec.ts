// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {_GlobalGridLayer, _A5Decoder} from '@deck.gl/geo-layers';

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

test('_GlobalGridLayer', t => {
  const testCases = generateLayerTests({
    Layer: _GlobalGridLayer<string>,
    sampleProps: {
      data,
      getCellId: d => d,
      globalGrid: _A5Decoder
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      t.ok(subLayer, 'subLayers rendered');

      if (layer.props.data.length) {
        t.equal(
          subLayer.state.paths.length,
          data.length,
          'should update PolygonLayers state.paths'
        );
      }
    }
  });

  testLayer({Layer: _GlobalGridLayer, testCases, onError: t.notOk});

  t.end();
});
