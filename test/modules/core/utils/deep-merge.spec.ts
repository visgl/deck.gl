// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {deepMergeViewState} from '@deck.gl/core/utils/deep-merge';

test('deepMergeViewState', t => {
  const TEST_CASES = [
    {
      a: {longitude: -122.45, latitude: 37.78, zoom: 8},
      b: {zoom: 9, bearing: -120},
      output: {longitude: -122.45, latitude: 37.78, zoom: 9, bearing: -120}
    },
    {
      a: {target: [0, 0, 0], zoom: 1},
      b: {target: [1, 2, 3]},
      output: {target: [1, 2, 3], zoom: 1}
    },
    {
      a: {target: [1, 2, 3], zoom: 1},
      b: {target: [NaN, 0], zoomY: 0},
      output: {target: [1, 0, 3], zoom: 1, zoomY: 0}
    }
  ];
  TEST_CASES.forEach(({a, b, output}) => {
    const result = deepMergeViewState(a, b);
    t.deepEqual(result, output, `should ${output ? '' : 'not '}be equal`);
  });

  t.end();
});
