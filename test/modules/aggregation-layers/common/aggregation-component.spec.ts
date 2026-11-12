// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ColumnLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {GridAggregation} from '../../../../modules/aggregation-layers/src/experimental/aggregation';
import {AggregatedLayer} from '../../../../modules/aggregation-layers/src/experimental/aggregated-layer';

const data = [
  {position: [0, 0], weight: 2},
  {position: [0.2, 0.2], weight: 3}
];

test('Aggregation descriptors retain output until accessor triggers change', () => {
  const first = new GridAggregation({data, getWeight: d => d.weight});
  first.updateComponent(null, () => {});
  const bins = first.bins;
  expect(bins[0].value).toBe(5);
  const second = new GridAggregation({data, getWeight: d => d.weight * 2});
  second.updateComponent(first, () => {});
  expect(second.bins).toBe(bins);
  first.finalizeComponent();
  expect(second.internalState!.component).toBe(second);
  const third = new GridAggregation({
    data,
    getWeight: d => d.weight * 2,
    updateTriggers: {getWeight: 1}
  });
  third.updateComponent(second, () => {});
  expect(third.bins[0].value).toBe(10);
  expect(third.bins).not.toBe(bins);
  third.finalizeComponent();
});

test('Aggregation host preserves results across rendering-only updates', () => {
  let bins;
  const first = new GridAggregation({data});
  const finalize = vi.spyOn(first, 'finalizeComponent');
  testLayer({
    Layer: AggregatedLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          aggregation: first,
          renderLayer: new ColumnLayer({
            id: 'render',
            diskResolution: 4,
            getPosition: d => d.position,
            getElevation: d => d.value
          })
        },
        onAfterUpdate({subLayer}) {
          bins = first.bins;
          expect(subLayer.props.data).toBe(bins);
        }
      },
      {
        updateProps: {aggregation: new GridAggregation({data}), opacity: 0.5},
        onAfterUpdate({subLayer}) {
          expect(subLayer.props.data).toBe(bins);
          expect(finalize).not.toHaveBeenCalled();
        }
      },
      {
        updateProps: {aggregation: new GridAggregation({data, cellSize: 0.1})},
        onAfterUpdate({subLayer}) {
          expect(subLayer.props.data.length).toBe(2);
        }
      }
    ]
  });
});
