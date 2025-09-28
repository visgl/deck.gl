// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {GreatCircleLayer} from '@deck.gl/geo-layers';

import * as FIXTURES from 'deck.gl-test/data';

test('GreatCircleLayer', t => {
  const testCases = generateLayerTests({
    Layer: GreatCircleLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: GreatCircleLayer, testCases, onError: t.notOk});

  t.end();
});
