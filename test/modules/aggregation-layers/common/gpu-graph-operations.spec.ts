// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUGraph, GPUGraphCompiler, gpuGraph} from '@luma.gl/graph/gpu-graph';
import {
  GPUGroupAggregationOperation,
  GPUReductionOperation,
  aggregationOperationLowerings
} from '../../../../modules/aggregation-layers/src/common/aggregator/gpu-graph/aggregation-operations';

test('Semantic aggregation composes masked groups and extent without CPU intermediates', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  device.handle.pushErrorScope('validation');
  const buffers = {
    keys: device.createBuffer({data: new Uint32Array([0, 1, 0, 1, 99]), usage: Buffer.STORAGE}),
    values: device.createBuffer({
      data: new Float32Array([2, 4, 6, 100, 1000]),
      usage: Buffer.STORAGE
    }),
    mask: device.createBuffer({data: new Uint32Array([1, 1, 1, 0, 1]), usage: Buffer.STORAGE}),
    groups: device.createBuffer({byteLength: 8, usage: Buffer.STORAGE | Buffer.COPY_SRC}),
    extent: device.createBuffer({byteLength: 8, usage: Buffer.STORAGE | Buffer.COPY_SRC})
  };
  const program = new GPUGraph();
  for (const name of ['keys', 'values', 'mask'] as const) {
    program.addInput(name, gpuGraph.vector(name === 'values' ? 'float32' : 'uint32', {length: 5}));
  }
  program.addState('groups', gpuGraph.vector('float32', {length: 2}));
  program.addState('extent', gpuGraph.vector('float32', {length: 2}));
  program.add([
    new GPUGroupAggregationOperation({
      keys: 'keys',
      values: 'values',
      mask: 'mask',
      output: 'groups',
      operation: 'sum'
    }),
    new GPUReductionOperation({input: 'groups', output: 'extent', operation: 'extent'})
  ]);
  const compilation = new GPUGraphCompiler(device, aggregationOperationLowerings).compile(program, {
    vectors: Object.fromEntries(
      Object.entries(buffers).map(([name, buffer]) => [
        name,
        new GPUVector({
          type: 'buffer',
          ownsBuffer: false,
          name,
          buffer,
          format: name === 'keys' || name === 'mask' ? 'uint32' : 'float32',
          length: name === 'groups' || name === 'extent' ? 2 : 5
        })
      ])
    )
  });
  const compiled = compilation.graph.compile();
  try {
    const encoder = device.createCommandEncoder();
    compiled.encode(encoder, {parameters: undefined});
    device.submit(encoder.finish());
    encoder.destroy();
    expect(Array.from(new Float32Array((await buffers.groups.readAsync()).buffer))).toEqual([8, 4]);
    expect(Array.from(new Float32Array((await buffers.extent.readAsync()).buffer))).toEqual([4, 8]);
  } finally {
    compiled.destroy();
    for (const buffer of Object.values(buffers)) {
      expect(buffer.destroyed).toBe(false);
      buffer.destroy();
    }
  }
  expect(await device.handle.popErrorScope()).toBeNull();
});
