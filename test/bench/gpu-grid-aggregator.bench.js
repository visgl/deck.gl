// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */
import {Attribute} from '@deck.gl/core';
import {CPUAggregator, WebGLAggregator} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils';

const BIN_COUNT = 128;
const POINT_COUNTS = [25_000, 100_000, 1_000_000];

export default function gridAggregatorBench(suite) {
  if (device.type !== 'webgl' || !WebGLAggregator.isSupported(device)) {
    return suite;
  }

  const testCases = POINT_COUNTS.map(createTestCase);
  suite = suite.group('AGGREGATION');

  for (const testCase of testCases) {
    suite = suite
      .add(`CPU ${formatCount(testCase.pointCount)} points`, () => {
        testCase.cpuAggregator.setNeedsUpdate();
        testCase.cpuAggregator.update();
      })
      .add(`GPU ${formatCount(testCase.pointCount)} points`, () => {
        testCase.gpuAggregator.setNeedsUpdate();
        testCase.gpuAggregator.preDraw();
        // preDraw submits WebGL work asynchronously. Wait so the benchmark measures completed work.
        device.gl.finish();
      });
  }

  return suite;
}

function createTestCase(pointCount) {
  const attributes = createAttributes(pointCount);
  const aggregationProps = {
    pointCount,
    attributes,
    operations: ['SUM']
  };

  const cpuAggregator = new CPUAggregator({
    dimensions: 2,
    getBin: {
      sources: ['positions'],
      getValue: ({positions}) => [Math.floor(positions[0]), Math.floor(positions[1])]
    },
    getValue: [{sources: ['weights'], getValue: ({weights}) => weights}]
  });
  cpuAggregator.setProps(aggregationProps);

  const gpuAggregator = new WebGLAggregator(device, {
    dimensions: 2,
    channelCount: 1,
    bufferLayout: [
      {name: 'positions', format: 'float32x2', stepMode: 'vertex'},
      {name: 'weights', format: 'float32', stepMode: 'vertex'}
    ],
    vs: /* glsl */ `
in vec2 positions;
in float weights;

void getBin(out ivec2 binId) {
  binId = ivec2(floor(positions));
}
void getValue(out float value) {
  value = weights;
}
`
  });
  gpuAggregator.setProps({
    ...aggregationProps,
    binIdRange: [
      [0, BIN_COUNT],
      [0, BIN_COUNT]
    ]
  });

  // Allocate outputs and compile shaders before the timed callbacks measure steady-state updates.
  cpuAggregator.update();
  gpuAggregator.preDraw();
  device.gl.finish();

  return {pointCount, cpuAggregator, gpuAggregator};
}

function createAttributes(pointCount) {
  const positions = new Float32Array(pointCount * 2);
  const weights = new Float32Array(pointCount);

  for (let index = 0; index < pointCount; index++) {
    positions[index * 2] = (index % BIN_COUNT) + 0.25;
    positions[index * 2 + 1] = (Math.floor(index / BIN_COUNT) % BIN_COUNT) + 0.25;
    weights[index] = (index % 10) + 1;
  }

  const positionAttribute = new Attribute(device, {
    id: 'positions',
    size: 2,
    type: 'float32',
    accessor: 'getPosition'
  });
  const weightAttribute = new Attribute(device, {
    id: 'weights',
    size: 1,
    type: 'float32',
    accessor: 'getWeight'
  });
  positionAttribute.setData({value: positions});
  weightAttribute.setData({value: weights});

  return {positions: positionAttribute, weights: weightAttribute};
}

function formatCount(count) {
  return count >= 1_000_000 ? `${count / 1_000_000}M` : `${count / 1_000}K`;
}
