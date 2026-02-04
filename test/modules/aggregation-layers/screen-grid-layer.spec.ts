// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {ScreenGridLayer, WebGLAggregator, CPUAggregator} from '@deck.gl/aggregation-layers';

const getPosition = d => d.COORDINATES;

test('ScreenGridLayer', () => {
  let testCases = generateLayerTests({
    Layer: ScreenGridLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: ScreenGridLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});
