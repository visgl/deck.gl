// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {TripsLayer} from '@deck.gl/geo-layers';
import {trips} from 'deck.gl-test/data';

test('TripsLayer', () => {
  const testCases = generateLayerTests({
    Layer: TripsLayer,
    sampleProps: {
      data: trips,
      getPath: d => d.map(p => p.begin_shape),
      getTimestamps: d => d.map(p => p.begin_time)
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  testLayer({Layer: TripsLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
