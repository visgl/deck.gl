// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {AttributeWithScale} from '../../../../modules/aggregation-layers/src/common/utils/scale-utils';
import {test, expect, vi} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {
  ScreenGridLayer,
  GridLayer,
  CPUAggregator,
  type Aggregator
} from '@deck.gl/aggregation-layers';
import {device, testLayer} from '@deck.gl/test-utils/vitest';
import {getAggregationAttribute} from '../../../../modules/aggregation-layers/src/common/aggregator/aggregation-result';

function createVector(
  name: string,
  format: 'float32' | 'float32x2',
  length: number,
  buffer: Buffer,
  byteOffset = 0,
  byteStride = format === 'float32' ? 4 : 8
) {
  return new GPUVector({
    type: 'buffer',
    name,
    format,
    length,
    buffer,
    byteOffset,
    byteStride,
    ownsBuffer: false
  });
}

test('Aggregation vectors preserve borrowed buffer ranges', () => {
  const buffer = device.createBuffer({byteLength: 64, usage: Buffer.VERTEX | Buffer.COPY_DST});
  const vector = createVector('weights', 'float32', 2, buffer, 12, 16);
  expect(getAggregationAttribute(vector)).toEqual({
    buffer,
    type: 'float32',
    size: 1,
    offset: 12,
    stride: 16
  });
  vector.destroy();
  expect(buffer.destroyed).toBe(false);
  buffer.destroy();
});

test('Aggregation factory lifecycle preserves default behavior', () => {
  const created: Aggregator[] = [];
  const makeFactory = () =>
    vi.fn(({createDefaultAggregator}) => {
      const aggregator = createDefaultAggregator();
      vi.spyOn(aggregator, 'destroy');
      created.push(aggregator);
      return aggregator;
    });
  const first = makeFactory();
  const second = makeFactory();
  testLayer({
    Layer: ScreenGridLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        title: 'create custom aggregator',
        props: {data: [{position: [0, 0]}], gpuAggregation: false, aggregator: first},
        onAfterUpdate: ({layer}) => {
          expect(first).toHaveBeenCalledTimes(1);
          expect(layer.state.aggregator).toBeInstanceOf(CPUAggregator);
        }
      },
      {
        title: 'reuse custom aggregator',
        updateProps: {cellSizePixels: 50},
        onAfterUpdate: () => expect(first).toHaveBeenCalledTimes(1)
      },
      {
        title: 'replace custom aggregator',
        updateProps: {aggregator: second},
        onAfterUpdate: () => {
          expect(second).toHaveBeenCalledTimes(1);
          expect(created[0].destroy).toHaveBeenCalledTimes(1);
        }
      },
      {
        title: 'restore default aggregator',
        updateProps: {aggregator: null},
        onAfterUpdate: ({layer}) => {
          expect(created[1].destroy).toHaveBeenCalledTimes(1);
          expect(layer.state.aggregator).toBeInstanceOf(CPUAggregator);
        }
      }
    ]
  });
});

test('Aggregation GPU columns bypass accessors and render borrowed vectors', () => {
  const buffer = device.createBuffer({
    data: new Float32Array([0, 0, 2]),
    usage: Buffer.VERTEX | Buffer.COPY_DST
  });
  const positions = createVector('positions', 'float32x2', 1, buffer);
  const weights = createVector('weights', 'float32', 1, buffer, 8);
  const aggregator: Aggregator = {
    binCount: 1,
    setProps: vi.fn(),
    setNeedsUpdate: vi.fn(),
    update: vi.fn(),
    preDraw: vi.fn(),
    destroy: vi.fn(),
    getBins: () => positions,
    getResult: () => weights,
    getResultDomain: vi.fn(() => {
      throw new Error('unexpected readback');
    }),
    getBin: () => null
  };
  const getPosition = vi.fn(() => {
    throw new Error('unexpected accessor');
  });
  try {
    testLayer({
      Layer: ScreenGridLayer,
      onError: error => {
        throw error;
      },
      testCases: [
        {
          title: 'render GPU columns',
          props: {
            positions,
            weights: [weights],
            aggregator: () => aggregator,
            colorDomain: [0, 2],
            getPosition
          },
          onAfterUpdate: ({layer}) => {
            expect(layer.getNumInstances()).toBe(1);
            expect(getPosition).not.toHaveBeenCalled();
            expect(aggregator.setProps).toHaveBeenCalledWith({positions, weights: [weights]});
            expect(aggregator.preDraw).toHaveBeenCalled();
            expect(aggregator.getResultDomain).not.toHaveBeenCalled();
          }
        }
      ]
    });
    expect(aggregator.destroy).toHaveBeenCalledTimes(1);
    expect(buffer.destroyed).toBe(false);
  } finally {
    positions.destroy();
    weights.destroy();
    buffer.destroy();
  }
});

test('GPU result adapters reject unsupported layouts', () => {
  const buffer = device.createBuffer({byteLength: 32, usage: Buffer.VERTEX});
  const first = createVector('first', 'float32', 1, buffer);
  const second = createVector('second', 'float32', 1, buffer, 4);
  const chunks = new GPUVector({
    type: 'data',
    name: 'chunks',
    data: [...first.data, ...second.data],
    ownsData: false
  });
  const integers = new GPUVector({
    type: 'buffer',
    name: 'integers',
    buffer,
    format: 'uint32',
    length: 1,
    ownsBuffer: false
  });
  try {
    expect(() => getAggregationAttribute(chunks)).toThrow('exactly one');
    expect(() => getAggregationAttribute(integers)).toThrow('float32');
  } finally {
    chunks.destroy();
    first.destroy();
    second.destroy();
    integers.destroy();
    buffer.destroy();
  }
});

test('Grid WebGPU results render with explicit domains without domain readback', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) return skip();
  expect(webgpuDevice.type).toBe('webgpu');
  webgpuDevice.handle.pushErrorScope('validation');
  const buffer = webgpuDevice.createBuffer({
    data: new Float32Array([0, 0, 2]),
    usage: Buffer.VERTEX | Buffer.COPY_DST
  });
  const positions = createVector('positions', 'float32x2', 1, buffer);
  const weights = createVector('weights', 'float32', 1, buffer, 8);
  let onUpdate: ((event: {channel: number}) => void) | undefined;
  const aggregator: Aggregator = {
    binCount: 1,
    setProps: props => {
      if (props.onUpdate) onUpdate = props.onUpdate;
    },
    setNeedsUpdate() {},
    update() {
      onUpdate?.({channel: 0});
      onUpdate?.({channel: 1});
    },
    preDraw() {},
    destroy() {},
    getBins: () => positions,
    getResult: () => weights,
    getResultDomain: vi.fn(() => {
      throw new Error('unexpected domain readback');
    }),
    getBin: () => null
  };
  try {
    testLayer({
      Layer: GridLayer,
      device: webgpuDevice,
      onError: error => {
        throw error;
      },
      testCases: [
        {
          title: 'GPU grid with explicit domains',
          props: {
            positions,
            weights: [weights, weights],
            dataBounds: [
              [0, 0],
              [0, 0]
            ],
            aggregator: () => aggregator,
            colorDomain: [0, 2],
            elevationDomain: [0, 2]
          },
          onAfterUpdate: () => expect(aggregator.getResultDomain).not.toHaveBeenCalled()
        }
      ]
    });
  } finally {
    positions.destroy();
    weights.destroy();
    buffer.destroy();
  }
  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();
});

(device.type === 'webgl' ? test : test.skip)(
  'AttributeWithScale preserves offset of contiguous GPU results',
  () => {
    const buffer = device.createBuffer({data: new Float32Array([1000, 1, 2, 3])});
    try {
      const scale = new AttributeWithScale({buffer, type: 'float32', size: 1, offset: 4}, 3);
      scale.update({scaleType: 'ordinal', lowerPercentile: 0, upperPercentile: 100});
      expect(Array.from(scale.attribute.value!)).toEqual([0, 1, 2]);
    } finally {
      buffer.destroy();
    }
  }
);
