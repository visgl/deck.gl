// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {AttributeWithScale} from '../../../../modules/aggregation-layers/src/common/utils/scale-utils';
import {test, expect, vi} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {LayerExtension, OrthographicView, Attribute} from '@deck.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {
  ScreenGridLayer,
  GridLayer,
  ContourLayer,
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

test('Aggregation instance lifecycle preserves default behavior', () => {
  const createAggregator = () => {
    const aggregator = new CPUAggregator({
      dimensions: 2,
      getBin: {sources: ['positions'], getValue: () => [0, 0]},
      getValue: [{sources: ['counts'], getValue: () => 1}]
    });
    return Object.assign(aggregator, {
      initialize: vi.fn(),
      destroy: vi.fn(),
      setNeedsUpdate: vi.fn(aggregator.setNeedsUpdate.bind(aggregator))
    });
  };
  const first = createAggregator();
  const second = createAggregator();
  const third = createAggregator();
  testLayer({
    Layer: ScreenGridLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        title: 'adopt custom aggregator',
        props: {data: [{position: [0, 0]}], gpuAggregation: false, aggregator: first},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.aggregator).toBe(first);
          expect(first.initialize).toHaveBeenCalledExactlyOnceWith(device);
        }
      },
      {
        title: 'reuse custom aggregator',
        updateProps: {cellSizePixels: 50},
        onAfterUpdate: () => {
          expect(first.initialize).toHaveBeenCalledTimes(1);
          expect(first.destroy).not.toHaveBeenCalled();
        }
      },
      {
        title: 'refresh extensions without destroying supplied instance',
        updateProps: {extensions: [new LayerExtension()]},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.aggregator).toBe(first);
          expect(first.initialize).toHaveBeenCalledTimes(1);
          expect(first.destroy).not.toHaveBeenCalled();
          expect(first.setNeedsUpdate).toHaveBeenCalled();
        }
      },
      {
        title: 'replace custom aggregator',
        updateProps: {aggregator: second},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.aggregator).toBe(second);
          expect(second.initialize).toHaveBeenCalledExactlyOnceWith(device);
          expect(first.destroy).toHaveBeenCalledTimes(1);
        }
      },
      {
        title: 'restore default aggregator',
        updateProps: {aggregator: null},
        onAfterUpdate: ({layer}) => {
          expect(second.destroy).toHaveBeenCalledTimes(1);
          expect(layer.state.aggregator).toBeInstanceOf(CPUAggregator);
          expect(layer.state.aggregator).not.toBe(second);
        }
      },
      {
        title: 'adopt instance for finalization',
        updateProps: {aggregator: third}
      }
    ]
  });
  expect(first.destroy).toHaveBeenCalledTimes(1);
  expect(second.destroy).toHaveBeenCalledTimes(1);
  expect(third.initialize).toHaveBeenCalledTimes(1);
  expect(third.destroy).toHaveBeenCalledTimes(1);
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
            aggregator,
            colorDomain: [0, 2],
            getPosition
          },
          onAfterUpdate: ({layer}) => {
            expect(layer.getNumInstances()).toBe(1);
            expect(getPosition).not.toHaveBeenCalled();
            expect(aggregator.setProps).toHaveBeenCalledWith({
              positions,
              weights: [weights],
              pointCount: 1
            });
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
            aggregator,
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

test('GPU column prefix updates refresh the aggregator count', () => {
  const buffer = device.createBuffer({data: new Float32Array(12), usage: Buffer.VERTEX});
  const positions = createVector('positions', 'float32x2', 4, buffer);
  const weights = createVector('weights', 'float32', 4, buffer, 32);
  let pointCount = 0;
  const totals: number[] = [];
  const aggregator: Aggregator = {
    binCount: 1,
    setProps: props => {
      if (props.pointCount !== undefined) pointCount = props.pointCount;
    },
    setNeedsUpdate: vi.fn(),
    update: () => {
      totals.push(pointCount);
    },
    preDraw() {},
    destroy() {},
    getBins: () => positions,
    getResult: () => weights,
    getResultDomain: () => [0, 1],
    getBin: () => null
  };
  try {
    testLayer({
      Layer: ScreenGridLayer,
      onError: error => {
        throw error;
      },
      testCases: [
        {
          title: 'full column',
          props: {positions, weights: [weights], aggregator},
          onAfterUpdate: () => expect(totals.at(-1)).toBe(4)
        },
        {
          title: 'shorter prefix',
          updateProps: {numInstances: 2},
          onAfterUpdate: () => expect(totals.at(-1)).toBe(2)
        },
        {
          title: 'empty prefix',
          updateProps: {numInstances: 0},
          onAfterUpdate: () => expect(totals.at(-1)).toBe(0)
        },
        {
          title: 'restore full prefix',
          updateProps: {numInstances: 4},
          onAfterUpdate: () => expect(totals.at(-1)).toBe(4)
        }
      ]
    });
  } finally {
    positions.destroy();
    weights.destroy();
    buffer.destroy();
  }
});

test('Custom contour aggregators receive result callbacks', () => {
  const aggregator = new CPUAggregator({
    dimensions: 2,
    getBin: {
      sources: ['positions'],
      getValue: (_values, index) => [index % 2, Math.floor(index / 2)]
    },
    getValue: [{sources: ['counts'], getValue: (_values, index) => (index === 0 ? 2 : 0)}]
  });
  testLayer({
    Layer: ContourLayer,
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {target: [0, 0, 0], zoom: 0}
    }),
    onError: error => {
      throw error;
    },
    testCases: [
      {
        title: 'publish contour results',
        props: {
          data: [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1]
          ],
          getPosition: d => d,
          cellSize: 1,
          contours: [{threshold: 1}],
          aggregator
        },
        onAfterUpdate: ({layer, subLayers}) => {
          expect(layer.state.aggregatedValueReader).toBeTypeOf('function');
          expect(layer.state.aggregatedValueReader?.(0, 0)).toBe(2);
          expect(subLayers.length).toBeGreaterThan(0);
        }
      }
    ]
  });
});

test('GPUVector attribute identity avoids rebinding unchanged storage', () => {
  const buffer = device.createBuffer({data: new Float32Array([0, 1, 2, 3]), usage: Buffer.VERTEX});
  const vector = createVector('values', 'float32', 2, buffer);
  const moved = createVector('values', 'float32', 2, buffer, 4);
  const attribute = new Attribute(device, {id: 'values', size: 1, accessor: 'getValue'});
  attribute.numInstances = 2;
  const setData = vi.spyOn(attribute, 'setData');
  try {
    attribute.setBinaryValue(vector);
    attribute.setBinaryValue(vector);
    expect(setData).toHaveBeenCalledTimes(1);
    attribute.setBinaryValue(moved);
    expect(setData).toHaveBeenCalledTimes(2);
    expect(attribute.getValue().values).toBe(buffer);
  } finally {
    attribute.delete();
    vector.destroy();
    moved.destroy();
    buffer.destroy();
  }
});

test('Shader-only changes skip CPU aggregators but invalidate custom GPU aggregators', () => {
  class UniformExtension extends LayerExtension {
    static defaultProps = {
      aggregationUniform: 0,
      getFilterWeight: {type: 'accessor', value: 1}
    };

    initializeState(this: ScreenGridLayer) {
      this.getAttributeManager()!.add({filterWeight: {size: 1, accessor: 'getFilterWeight'}});
    }
  }
  for (const cpu of [true, false]) {
    const delegate = new CPUAggregator({
      dimensions: 2,
      getBin: {sources: ['positions'], getValue: () => [0, 0]},
      getValue: [{sources: ['counts'], getValue: () => 1}]
    });
    const aggregator = cpu
      ? delegate
      : {
          get binCount() {
            return delegate.binCount;
          },
          setProps: delegate.setProps.bind(delegate),
          setNeedsUpdate: delegate.setNeedsUpdate.bind(delegate),
          update: delegate.update.bind(delegate),
          preDraw: delegate.preDraw.bind(delegate),
          getBins: delegate.getBins.bind(delegate),
          getResult: delegate.getResult.bind(delegate),
          getResultDomain: delegate.getResultDomain.bind(delegate),
          getBin: delegate.getBin.bind(delegate),
          destroy: delegate.destroy.bind(delegate)
        };
    const setProps = vi.spyOn(aggregator, 'setProps');
    const setNeedsUpdate = vi.spyOn(aggregator, 'setNeedsUpdate');
    testLayer({
      Layer: ScreenGridLayer,
      onError: error => {
        throw error;
      },
      testCases: [
        {
          props: {
            data: [{position: [0, 0]}],
            aggregator,
            extensions: [new UniformExtension()],
            getFilterWeight: () => 1
          },
          onAfterUpdate({layer}) {
            setProps.mockClear();
            layer.setShaderModuleProps({testUniforms: {value: 1}});
            if (cpu) expect(setProps).not.toHaveBeenCalled();
            else
              expect(setProps).toHaveBeenCalledWith({
                shaderModuleProps: {testUniforms: {value: 1}}
              });
            setNeedsUpdate.mockClear();
          }
        },
        {
          updateProps: {aggregationUniform: 1},
          onAfterUpdate() {
            if (cpu) expect(setNeedsUpdate).not.toHaveBeenCalled();
            else expect(setNeedsUpdate).toHaveBeenCalled();
            setNeedsUpdate.mockClear();
          }
        },
        {
          updateProps: {getFilterWeight: () => 2, updateTriggers: {getFilterWeight: 1}},
          onAfterUpdate() {
            if (cpu) expect(setNeedsUpdate).not.toHaveBeenCalled();
            else expect(setNeedsUpdate).toHaveBeenCalled();
          }
        }
      ]
    });
  }
});
