// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */
// TODO: remove hard path once @deck.gl/experimental-layers published with GPUScreenGridLayer
import {_GPUGridAggregator as GPUGridAggregator} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl-test/data';

const {fixture, generateRandomGridPoints, buildAttributes} = GridAggregationData;
const aggregator = new GPUGridAggregator(device);
const changeFlags = {cellSizeChanged: true};
const points25K = generateRandomGridPoints(25000);
const points100K = generateRandomGridPoints(100000);
const points1M = generateRandomGridPoints(1000000);

export default function gridAggregatorBench(suite) {
  if (device.info.type !== 'webgl2') {
    return suite;
  }
  return suite
    .group('GRID AGGREGATION')
    .add('CPU 25K', () => {
      runAggregation({useGPU: false, data: points25K});
    })
    .add('GPU 25K', () => {
      runAggregation({useGPU: true, data: points25K});
    })
    .add('CPU 25K with projection', () => {
      runAggregation({useGPU: false, projectPoints: true, data: points25K});
    })
    .add('GPU 25K with projection', () => {
      runAggregation({useGPU: true, projectPoints: true, data: points25K});
    })
    .add('CPU 100K', () => {
      runAggregation({useGPU: false, data: points100K});
    })
    .add('GPU 100K', () => {
      runAggregation({useGPU: true, data: points100K});
    })
    .add('CPU 100K with projection', () => {
      runAggregation({useGPU: false, projectPoints: true, data: points100K});
    })
    .add('GPU 100K with projection', () => {
      runAggregation({useGPU: true, projectPoints: true, data: points100K});
    })
    .add('CPU 1M', () => {
      runAggregation({useGPU: false, data: points1M});
    })
    .add('GPU 1M', () => {
      runAggregation({useGPU: true, data: points1M});
    })
    .add('CPU 1M with projection', () => {
      runAggregation({useGPU: false, projectPoints: true, data: points1M});
    })
    .add('GPU 1M with projection', () => {
      runAggregation({useGPU: true, projectPoints: true, data: points1M});
    });
}

function runAggregation(opts) {
  const results = aggregator.run(
    Object.assign(
      {},
      fixture,
      {changeFlags},
      buildAttributes({data: opts.data, weights: fixture.weights})
    )
  );
  if (opts.useGPU) {
    // Call getData to sync GPU and CPU.
    results.weight1.aggregationBuffer.getData();
    results.weight1.minBuffer.getData();
    results.weight1.maxBuffer.getData();
  }
}
