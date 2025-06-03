// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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

test('A5Layer', t => {
  const testCases = generateLayerTests({
    Layer: A5Layer,
    sampleProps: {
      data,
      getPentagon: d => d
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

  testLayer({Layer: A5Layer, testCases, onError: t.notOk});

  t.end();
});
