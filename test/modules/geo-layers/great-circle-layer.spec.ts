// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
import {GreatCircleLayer} from '@deck.gl/geo-layers';

import * as FIXTURES from 'deck.gl-test/data';

test('GreatCircleLayer', () => {
  const testCases = generateLayerTests({
    Layer: GreatCircleLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  testLayer({Layer: GreatCircleLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
