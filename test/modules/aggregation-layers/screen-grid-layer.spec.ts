// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {ScreenGridLayer, WebGLAggregator, CPUAggregator} from '@deck.gl/aggregation-layers';

const getPosition = d => d.COORDINATES;

test('ScreenGridLayer', t => {
  let testCases = generateLayerTests({
    Layer: ScreenGridLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: ScreenGridLayer, testCases, onError: t.notOk});

  t.end();
});
