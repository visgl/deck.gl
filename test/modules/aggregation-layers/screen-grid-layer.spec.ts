// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
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

  testLayer({Layer: ScreenGridLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('ScreenGridLayer GPU aggregation applies DataFilter plugins', async ({skip}) => {
  const {device} = await import('@deck.gl/test-utils/vitest');
  const {DataFilterExtension} = await import('@deck.gl/extensions');
  if (!WebGLAggregator.isSupported(device)) return skip();
  testLayer({
    Layer: ScreenGridLayer,
    testCases: [
      {
        props: {
          data: [
            {weight: 1, filter: 0},
            {weight: 100, filter: 1}
          ],
          getPosition: [0, 0],
          getWeight: d => d.weight,
          getFilterValue: d => d.filter,
          filterRange: [0, 0],
          extensions: [new DataFilterExtension({filterSize: 1})],
          gpuAggregation: true
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.aggregator).toBeInstanceOf(WebGLAggregator);
          expect(layer.state.aggregator.getResultDomain(0)[1]).toBe(1);
        }
      }
    ],
    onError: error => {
      throw error;
    }
  });
});
